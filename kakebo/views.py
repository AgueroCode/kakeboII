from kakebo import app
from kakebo.dataaccess import DBmanager
from flask import jsonify, render_template, request
import sqlite3
from http import HTTPStatus

dbManager = DBmanager(app.config.get('DATABASE'))

@app.route('/')
def listaMovimientos():
    return render_template('spa.html')

@app.route('/api/v1/movimientos')
def movimientosAPI():
    query = "SELECT * FROM movimientos order by fecha;"
    
    try:
        lista = dbManager.consultaMuchasSQL(query)
        return jsonify({'status': 'success', 'movimientos': lista})
    except sqlite3.Error as e:
        return jsonify({'status': 'fail', 'mensaje': str(e)})

@app.route('/api/v1/movimiento/<int:id>', methods=['GET', 'PUT', 'DELETE'])
@app.route('/api/v1/movimiento', methods=['POST'])
def detalleMovimiento(id=None):

    try:
        if request.method in ('GET', 'PUT', 'DELETE'):
            movimiento = dbManager.consultaUnaSQL("SELECT * FROM movimientos WHERE id = ?", [id])
        
        if request.method == 'GET':
            if movimiento: 
                return jsonify({
                    "status": "success",
                    "movimiento": movimiento
                })
            else:
                return jsonify({"status": "fail", "mensaje": "movimiento no encontrado"}), HTTPStatus.NOT_FOUND
        
        if request.method == 'PUT':
            dbManager.modificaTablaSQL("""
                UPDATE movimientos 
                    SET fecha=:fecha, concepto=:concepto, esGasto=:esGasto, categoria=:categoria, cantidad=:cantidad 
                WHERE id = {}""".format(id), request.json) 
            # lo hacemos asi porque queremos un diccionario que es como nos llega tambien la informacion lo de los dos puntos es por eso

            return jsonify({"status": "success", "mensaje": "registro modificado"})
    except sqlite3.Error as e:
        return jsonify({"status": "fail", "mensaje": "Error en base de datos: {}".format(e)}), HTTPStatus.BAD_REQUEST
