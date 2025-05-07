import pytest
import requests

BASE_URL = "http://localhost:8000"
ADMIN_USER = "admin"
ADMIN_PASS = "123456"  # Cambia esto por la contraseña real

@pytest.fixture(scope="session")
def get_jwt_token():
    url = f"{BASE_URL}/api/token/"
    data = {"username": ADMIN_USER, "password": ADMIN_PASS}
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

def test_pedidos_crud(get_jwt_token):
    # Crear pedido
    url = f"{BASE_URL}/api/pedidos/"
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    data = {"cliente": 1, "direccion_entrega": "Calle 123", "contacto": "88888888", "info_adicional": "Ninguna", "estado": "pendiente"}
    r = requests.post(url, json=data, headers=headers)
    assert r.status_code == 201
    pedido_id = r.json()["id"]
    # Listar pedidos
    r = requests.get(url, headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{url}{pedido_id}/", headers=headers)
    assert r.status_code == 200
    # Actualizar
    data["direccion_entrega"] = "Calle 456"
    r = requests.put(f"{url}{pedido_id}/", json=data, headers=headers)
    assert r.status_code == 200
    # Eliminar
    r = requests.delete(f"{url}{pedido_id}/", headers=headers)
    assert r.status_code == 204

def test_facturas_crud(get_jwt_token):
    # Crear pedido para la factura
    pedido_url = f"{BASE_URL}/api/pedidos/"
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    pedido_data = {"cliente": 1, "direccion_entrega": "Calle 123", "contacto": "88888888", "info_adicional": "Ninguna", "estado": "pendiente"}
    r = requests.post(pedido_url, json=pedido_data, headers=headers)
    assert r.status_code == 201
    pedido_id = r.json()["id"]
    # Crear factura
    url = f"{BASE_URL}/api/facturas/"
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
    # Listar facturas
    r = requests.get(url, headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{url}{factura_id}/", headers=headers)
    assert r.status_code == 200
    # Actualizar
    data["nombre_vendedor"] = "Vendedor Editado"
    r = requests.put(f"{url}{factura_id}/", json=data, headers=headers)
    assert r.status_code == 200
    # Eliminar
    r = requests.delete(f"{url}{factura_id}/", headers=headers)
    assert r.status_code == 204
