import pytest
import requests
import time

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
    # Crear categoría válida como admin (los vendedores no pueden crear categorías ni productos)
    admin_token = get_jwt_token_for('admin', 'admin123')
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    unique_cat = f"Categoria Test {int(time.time()*1000)}"
    cat_url = f"{BASE_URL}/api/categorias/"
    cat_data = {"nombre": unique_cat}
    r = requests.post(cat_url, json=cat_data, headers=admin_headers)
    assert r.status_code == 201
    cat_id = r.json()["id"]
    data = {"nombre": "Producto Test", "precio": 10.5, "descripcion": "desc", "categoria": cat_id}
    r = requests.post(url, json=data, headers=headers)
    # Los vendedores no pueden crear productos, debe ser 403 o 401
    assert r.status_code in (401, 403)
    # Cleanup: eliminar la categoría creada
    requests.delete(f"{cat_url}{cat_id}/", headers=admin_headers)

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

# --- ORDENES CRUD Y ANIDADOS ---
@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_ordenes_crud_and_nested(get_jwt_token):
    from orders.models.base import Producto
    Producto.objects.all().delete()  # Limpia productos antes del test
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    unique_cat = f"TestCat_{int(time.time()*1000)}"
    # Crear categoría
    categoria_data = {"nombre": unique_cat}
    r = requests.post(f"{BASE_URL}/api/categorias/", json=categoria_data, headers=headers)
    assert r.status_code == 201
    categoria_id = r.json()["id"]
    # Crear impuesto
    impuesto_data = {"nombre": "IVA Test", "codigo": "99", "tarifa": 13, "es_exento": False}
    r = requests.post(f"{BASE_URL}/api/impuestos/", json=impuesto_data, headers=headers)
    assert r.status_code == 201
    impuesto_id = r.json()["id"]
    # Crear producto
    producto_data = {"nombre": f"Producto Test {int(time.time()*1000)}", "precio": 1000, "descripcion": "desc", "categoria": categoria_id}
    r = requests.post(f"{BASE_URL}/api/productos/", json=producto_data, headers=headers)
    if r.status_code != 201:
        print('Detalle error producto:', r.status_code, r.text)
    assert r.status_code == 201
    producto_id = r.json()["id"]
    # Crear orden
    orden_data = {"cliente": 1, "tipo": "SALON"}
    r = requests.post(f"{BASE_URL}/api/ordenes/", json=orden_data, headers=headers)
    assert r.status_code == 201
    orden_id = r.json()["id"]
    # Listar ordenes
    r = requests.get(f"{BASE_URL}/api/ordenes/", headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{BASE_URL}/api/ordenes/{orden_id}/", headers=headers)
    assert r.status_code == 200
    # Crear línea anidada (sin campo 'orden')
    linea_data = {
        "producto": producto_id, "cantidad": 2, "unidad_medida": "Unid", "detalle": "Test", "precio_unitario": 1000, "subtotal": 2000, "descuento": 0, "impuesto": impuesto_id, "total_linea": 2260
    }
    r = requests.post(f"{BASE_URL}/api/ordenes/{orden_id}/lineas/", json=linea_data, headers=headers)
    if r.status_code != 201:
        print("\n[DEBUG][test_ordenes_crud_and_nested]", r.status_code, r.text)
    assert r.status_code == 201
    linea_id = r.json()["id"]
    # Listar líneas anidadas
    r = requests.get(f"{BASE_URL}/api/ordenes/{orden_id}/lineas/", headers=headers)
    assert r.status_code == 200
    # Error: crear línea sin producto
    bad_linea = linea_data.copy(); bad_linea.pop("producto")
    r = requests.post(f"{BASE_URL}/api/ordenes/{orden_id}/lineas/", json=bad_linea, headers=headers)
    assert r.status_code == 400
    # Crear cargo anidado
    cargo_data = {"nombre": "Servicio", "tipo": "SERVICIO", "monto": 500, "es_impuesto": False}
    r = requests.post(f"{BASE_URL}/api/ordenes/{orden_id}/cargos/", json=cargo_data, headers=headers)
    assert r.status_code == 201
    cargo_id = r.json()["id"]
    # Listar cargos anidados
    r = requests.get(f"{BASE_URL}/api/ordenes/{orden_id}/cargos/", headers=headers)
    assert r.status_code == 200
    # Error: crear cargo sin nombre
    bad_cargo = cargo_data.copy(); bad_cargo.pop("nombre")
    r = requests.post(f"{BASE_URL}/api/ordenes/{orden_id}/cargos/", json=bad_cargo, headers=headers)
    assert r.status_code == 400
    # Recalcular totales
    r = requests.post(f"{BASE_URL}/api/ordenes/{orden_id}/calcular/", headers=headers)
    assert r.status_code == 200
    # Eliminar línea
    r = requests.delete(f"{BASE_URL}/api/ordenes/{orden_id}/lineas/{linea_id}/", headers=headers)
    assert r.status_code == 204
    # Eliminar cargo
    r = requests.delete(f"{BASE_URL}/api/ordenes/{orden_id}/cargos/{cargo_id}/", headers=headers)
    assert r.status_code == 204
    # Eliminar orden
    r = requests.delete(f"{BASE_URL}/api/ordenes/{orden_id}/", headers=headers)
    assert r.status_code == 204
    # Error: acceder a línea/cargo de orden inexistente
    r = requests.get(f"{BASE_URL}/api/ordenes/99999/lineas/", headers=headers)
    assert r.status_code in (404, 200)  # Puede ser 404 o 200 vacía
    r = requests.get(f"{BASE_URL}/api/ordenes/99999/cargos/", headers=headers)
    assert r.status_code in (404, 200)
    # Cleanup: eliminar la categoría creada
    requests.delete(f"{BASE_URL}/api/categorias/{categoria_id}/", headers=headers)

# --- IMPUESTOS CRUD ---
@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_impuestos_crud(get_jwt_token):
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    data = {"nombre": "IVA Test", "codigo": "99", "tarifa": 5, "es_exento": False}
    r = requests.post(f"{BASE_URL}/api/impuestos/", json=data, headers=headers)
    assert r.status_code == 201
    imp_id = r.json()["id"]
    r = requests.get(f"{BASE_URL}/api/impuestos/", headers=headers)
    assert r.status_code == 200
    r = requests.get(f"{BASE_URL}/api/impuestos/{imp_id}/", headers=headers)
    assert r.status_code == 200
    data["tarifa"] = 7
    r = requests.put(f"{BASE_URL}/api/impuestos/{imp_id}/", json=data, headers=headers)
    assert r.status_code == 200
    r = requests.delete(f"{BASE_URL}/api/impuestos/{imp_id}/", headers=headers)
    assert r.status_code == 204
    # Error: crear sin nombre
    bad = data.copy(); bad.pop("nombre")
    r = requests.post(f"{BASE_URL}/api/impuestos/", json=bad, headers=headers)
    assert r.status_code == 400

# --- ORDENES-LINEAS Y ORDENES-CARGOS CRUD (no anidados) ---
@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_ordenes_lineas_y_cargos_crud_flat(get_jwt_token):
    from orders.models.base import Producto
    Producto.objects.all().delete()  # Limpia productos antes del test
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    # Crear dependencias: categoría, impuesto, producto
    unique_cat = f"Categoria Flat {int(time.time()*1000)}"
    cat_url = f"{BASE_URL}/api/categorias/"
    cat_data = {"nombre": unique_cat}
    r = requests.post(cat_url, json=cat_data, headers=headers)
    assert r.status_code == 201
    cat_id = r.json()["id"]
    imp_url = f"{BASE_URL}/api/impuestos/"
    imp_data = {"nombre": "IVA Flat", "codigo": "99", "tarifa": 13, "es_exento": False}
    r = requests.post(imp_url, json=imp_data, headers=headers)
    assert r.status_code == 201
    imp_id = r.json()["id"]
    prod_url = f"{BASE_URL}/api/productos/"
    prod_data = {"nombre": f"Producto Flat {int(time.time()*1000)}", "precio": 100, "descripcion": "desc flat", "categoria": cat_id}
    r = requests.post(prod_url, json=prod_data, headers=headers)
    if r.status_code != 201:
        print('Detalle error producto:', r.status_code, r.text)
    assert r.status_code == 201
    prod_id = r.json()["id"]
    # Crear orden
    orden_data = {"cliente": 1, "tipo": "SALON"}
    r = requests.post(f"{BASE_URL}/api/ordenes/", json=orden_data, headers=headers)
    assert r.status_code == 201
    orden_id = r.json()["id"]
    linea_data = {
        "orden": orden_id, "producto": prod_id, "cantidad": 1, "unidad_medida": "Unid", "detalle": "Flat", "precio_unitario": 100, "subtotal": 100, "descuento": 0, "impuesto": imp_id, "total_linea": 113
    }
    r = requests.post(f"{BASE_URL}/api/ordenes-lineas/", json=linea_data, headers=headers)
    if r.status_code != 201:
        print("\n[DEBUG][test_ordenes_lineas_y_cargos_crud_flat]", r.status_code, r.text)
    assert r.status_code == 201
    linea_id = r.json()["id"]
    # Listar líneas
    r = requests.get(f"{BASE_URL}/api/ordenes-lineas/", headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{BASE_URL}/api/ordenes-lineas/{linea_id}/", headers=headers)
    assert r.status_code == 200
    # Error: crear sin producto
    bad_linea = linea_data.copy(); bad_linea.pop("producto")
    r = requests.post(f"{BASE_URL}/api/ordenes-lineas/", json=bad_linea, headers=headers)
    assert r.status_code == 400
    # Eliminar línea
    r = requests.delete(f"{BASE_URL}/api/ordenes-lineas/{linea_id}/", headers=headers)
    assert r.status_code == 204
    # Crear cargo plano
    cargo_data = {"orden": orden_id, "nombre": "ServicioFlat", "tipo": "SERVICIO", "monto": 10, "es_impuesto": False}
    r = requests.post(f"{BASE_URL}/api/ordenes-cargos/", json=cargo_data, headers=headers)
    assert r.status_code == 201
    cargo_id = r.json()["id"]
    # Listar cargos
    r = requests.get(f"{BASE_URL}/api/ordenes-cargos/", headers=headers)
    assert r.status_code == 200
    # Detalle
    r = requests.get(f"{BASE_URL}/api/ordenes-cargos/{cargo_id}/", headers=headers)
    assert r.status_code == 200
    # Error: crear sin nombre
    bad_cargo = cargo_data.copy(); bad_cargo.pop("nombre")
    r = requests.post(f"{BASE_URL}/api/ordenes-cargos/", json=bad_cargo, headers=headers)
    assert r.status_code == 400
    # Eliminar cargo
    r = requests.delete(f"{BASE_URL}/api/ordenes-cargos/{cargo_id}/", headers=headers)
    assert r.status_code == 204
    # Eliminar orden
    r = requests.delete(f"{BASE_URL}/api/ordenes/{orden_id}/", headers=headers)
    assert r.status_code == 204
    # Cleanup: eliminar la categoría creada
    requests.delete(f"{cat_url}{cat_id}/", headers=headers)

# --- ORDENES-LINEAS Y ORDENES-CARGOS: errores de permisos y autenticación ---
def test_ordenes_lineas_y_cargos_no_auth():
    # Sin token
    linea_data = {"orden": 1, "producto": 1, "cantidad": 1, "unidad_medida": "Unid", "detalle": "Flat", "precio_unitario": 100, "subtotal": 100, "descuento": 0, "impuesto": 1, "total_linea": 113}
    r = requests.post(f"{BASE_URL}/api/ordenes-lineas/", json=linea_data)
    assert r.status_code == 401
    cargo_data = {"orden": 1, "nombre": "ServicioFlat", "tipo": "SERVICIO", "monto": 10, "es_impuesto": False}
    r = requests.post(f"{BASE_URL}/api/ordenes-cargos/", json=cargo_data)
    assert r.status_code == 401

# --- ORDENES-LINEAS Y ORDENES-CARGOS: errores de recursos inexistentes ---
@pytest.mark.parametrize('get_jwt_token', ['admin'], indirect=True)
def test_ordenes_lineas_y_cargos_not_found(get_jwt_token):
    headers = {"Authorization": f"Bearer {get_jwt_token}"}
    # Línea inexistente
    r = requests.get(f"{BASE_URL}/api/ordenes-lineas/99999/", headers=headers)
    assert r.status_code == 404
    # Cargo inexistente
    r = requests.get(f"{BASE_URL}/api/ordenes-cargos/99999/", headers=headers)
    assert r.status_code == 404

# --- ORDENES: errores de autenticación ---
def test_ordenes_no_auth():
    orden_data = {"cliente": 1, "tipo": "SALON"}
    r = requests.post(f"{BASE_URL}/api/ordenes/", json=orden_data)
    assert r.status_code == 401

# --- IMPUESTOS: errores de autenticación y permisos ---
def test_impuestos_no_auth():
    data = {"nombre": "IVA Test", "codigo": "99", "tarifa": 5, "es_exento": False}
    r = requests.post(f"{BASE_URL}/api/impuestos/", json=data)
    assert r.status_code == 401

def test_impuestos_no_admin(get_jwt_token):
    # Un cliente o vendedor no puede crear impuestos
    token = get_jwt_token_for('cliente', CLIENTE_PASS)
    headers = {"Authorization": f"Bearer {token}"}
    data = {"nombre": "IVA Test", "codigo": "99", "tarifa": 5, "es_exento": False}
    r = requests.post(f"{BASE_URL}/api/impuestos/", json=data, headers=headers)
    assert r.status_code in (401, 403)
