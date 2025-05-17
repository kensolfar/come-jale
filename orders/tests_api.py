import pytest
import requests

BASE_URL = "http://localhost:8000"
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"  # Contraseña real del usuario admin
CLIENTE_USER = "cliente"
CLIENTE_PASS = "cliente123"

@pytest.fixture(scope="session")
def get_jwt_token(request):
    user = getattr(request, 'param', None) or ADMIN_USER
    pwd = {
        'admin': ADMIN_PASS,
        'cliente': CLIENTE_PASS,
        'vendedor': 'vendedor123',
        'repartidor': 'repartidor123',
    }.get(user, ADMIN_PASS)
    url = f"{BASE_URL}/api/token/"
    data = {"username": user, "password": pwd}
    r = requests.post(url, json=data)
    assert r.status_code == 200
    return r.json()["access"]

def test_token_obtain_success():
    url = f"{BASE_URL}/api/token/"
    data = {"username": ADMIN_USER, "password": ADMIN_PASS}
    r = requests.post(url, json=data)
    assert r.status_code == 200
    assert "access" in r.json()

def test_token_obtain_invalid():
    url = f"{BASE_URL}/api/token/"
    data = {"username": ADMIN_USER, "password": "incorrecto"}
    r = requests.post(url, json=data)
    assert r.status_code == 401

def test_productos_list(get_jwt_token):
    url = f"{BASE_URL}/api/productos/"
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    r = requests.get(url, headers=headers)
    assert r.status_code == 200

def test_productos_create_no_token():
    url = f"{BASE_URL}/api/productos/"
    data = {"nombre": "Producto Test", "precio": 10.5, "descripcion": "desc", "categoria": "cat"}
    r = requests.post(url, json=data)
    assert r.status_code == 401

@pytest.mark.parametrize('get_jwt_token', ['vendedor'], indirect=True)
def test_productos_create(get_jwt_token):
    url = f"{BASE_URL}/api/productos/"
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    data = {"nombre": "Producto Test", "precio": 10.5, "descripcion": "desc", "categoria": "cat"}
    r = requests.post(url, json=data, headers=headers)
    assert r.status_code == 201
    assert r.json()["nombre"] == "Producto Test"
    # Guardar el id para pruebas posteriores
    global producto_id
    producto_id = r.json()["id"]

@pytest.mark.parametrize('get_jwt_token', ['cliente'], indirect=True)
def test_pedidos_crud(get_jwt_token):
    # Crear pedido
    url = f"{BASE_URL}/api/pedidos/"
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    data = {"cliente": 2, "direccion_entrega": "Calle 123", "contacto": "88888888", "info_adicional": "Ninguna", "estado": "pendiente"}
    r = requests.post(url, json=data, headers=headers)
    assert r.status_code == 201
    pedido_id = r.json()["id"]
    # Listar pedidos
    r = requests.get(url, headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{url}{pedido_id}/", headers=headers)
    assert r.status_code == 200
    # Actualizar (no permitido para cliente)
    data["direccion_entrega"] = "Calle 456"
    r = requests.put(f"{url}{pedido_id}/", json=data, headers=headers)
    assert r.status_code == 403
    # Eliminar (no permitido para cliente)
    r = requests.delete(f"{url}{pedido_id}/", headers=headers)
    assert r.status_code == 403

@pytest.mark.parametrize('get_jwt_token', ['vendedor'], indirect=True)
def test_facturas_crud(get_jwt_token):
    # Crear pedido como cliente, luego factura como vendedor
    cliente_token = get_jwt_token_for('cliente', 'cliente123')
    pedido_url = f"{BASE_URL}/api/pedidos/"
    pedido_headers = {"Authorization": f"Bearer {cliente_token}"}
    pedido_data = {"cliente": 2, "direccion_entrega": "Calle 123", "contacto": "88888888", "info_adicional": "Ninguna", "estado": "pendiente"}
    r = requests.post(pedido_url, json=pedido_data, headers=pedido_headers)
    assert r.status_code == 201
    pedido_id = r.json()["id"]
    # Crear factura como vendedor
    vendedor_token = get_jwt_token_for('vendedor', 'vendedor123')
    url = f"{BASE_URL}/api/facturas/"
    headers = {"Authorization": f"Bearer {vendedor_token}"}
    data = {
        "pedido": pedido_id,
        "nombre_vendedor": "Vendedor Test",
        "domicilio_vendedor": "Dirección Vendedor",
        "nombre_destinatario": "Cliente Test",
        "domicilio_destinatario": "Dirección Cliente",
        "descripcion_mercancias": "Productos varios",
        "tipo_embalaje": "Caja",
        "marcas": "MarcaX",
        "numeros": "123",
        "clases": "ClaseA",
        "cantidades": "10",
        "termino_comercial": "FOB",
        "fletes": 5.0,
        "seguro": 1.0,
        "lugar_expedicion": "San José",
        "metodo_pago": "Efectivo",
        "monto_total": 100.0
    }
    r = requests.post(url, json=data, headers=headers)
    assert r.status_code == 201
    factura_id = r.json()["id"]
    r = requests.get(url, headers=headers)
    assert r.status_code == 200
    r = requests.get(f"{url}{factura_id}/", headers=headers)
    assert r.status_code == 200
    data["nombre_vendedor"] = "Vendedor Editado"
    r = requests.put(f"{url}{factura_id}/", json=data, headers=headers)
    assert r.status_code == 200
    r = requests.delete(f"{url}{factura_id}/", headers=headers)
    assert r.status_code == 204

@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_entregas_crud(get_jwt_token):
    # Crear pedido y ruta para la entrega
    # El pedido debe ser creado por un cliente, la ruta por admin
    cliente_token = get_jwt_token_for('cliente', 'cliente123')
    admin_token = get_jwt_token_for('admin', 'admin123')
    pedido_url = f"{BASE_URL}/api/pedidos/"
    ruta_url = f"{BASE_URL}/api/rutas/"
    pedido_headers = {"Authorization": f"Bearer {cliente_token}"}
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    pedido_data = {"cliente": 1, "direccion_entrega": "Calle 123", "contacto": "88888888", "info_adicional": "Ninguna", "estado": "pendiente"}
    r = requests.post(pedido_url, json=pedido_data, headers=pedido_headers)
    assert r.status_code == 201
    pedido_id = r.json()["id"]
    ruta_data = {"nombre": "Ruta Entrega"}
    r = requests.post(ruta_url, json=ruta_data, headers=admin_headers)
    assert r.status_code == 201
    ruta_id = r.json()["id"]
    # Crear entrega
    url = f"{BASE_URL}/api/entregas/"
    data = {"pedido": pedido_id, "ruta": ruta_id, "estado": "pendiente"}
    r = requests.post(url, json=data, headers=admin_headers)
    assert r.status_code == 201
    entrega_id = r.json()["id"]
    r = requests.get(url, headers=admin_headers)
    assert r.status_code == 200
    r = requests.get(f"{url}{entrega_id}/", headers=admin_headers)
    assert r.status_code == 200
    data["estado"] = "en_ruta"
    r = requests.put(f"{url}{entrega_id}/", json=data, headers=admin_headers)
    assert r.status_code == 200
    r = requests.delete(f"{url}{entrega_id}/", headers=admin_headers)
    assert r.status_code == 204

def get_jwt_token_for(user, pwd):
    url = f"{BASE_URL}/api/token/"
    data = {"username": user, "password": pwd}
    r = requests.post(url, json=data)
    assert r.status_code == 200
    return r.json()["access"]

@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_clienteruta_crud(get_jwt_token):
    # Crear usuario y ruta para ClienteRuta
    admin_token = get_jwt_token_for('admin', 'admin123')
    ruta_url = f"{BASE_URL}/api/rutas/"
    headers = {"Authorization": f"Bearer {admin_token}"}
    ruta_data = {"nombre": "Ruta Cliente"}
    r = requests.post(ruta_url, json=ruta_data, headers=headers)
    assert r.status_code == 201
    ruta_id = r.json()["id"]
    # NOTA: El usuario con id=1 debe existir (admin por defecto)
    url = f"{BASE_URL}/api/clientes-ruta/"
    data = {"cliente": 1, "ruta": ruta_id, "latitud": 19.4326, "longitud": -99.1332, "direccion": "CDMX"}
    r = requests.post(url, json=data, headers=headers)
    assert r.status_code == 201
    cr_id = r.json()["id"]
    r = requests.get(url, headers=headers)
    assert r.status_code == 200
    r = requests.get(f"{url}{cr_id}/", headers=headers)
    assert r.status_code == 200
    data["direccion"] = "EDOMEX"
    r = requests.put(f"{url}{cr_id}/", json=data, headers=headers)
    assert r.status_code == 200
    r = requests.delete(f"{url}{cr_id}/", headers=headers)
    assert r.status_code == 204
