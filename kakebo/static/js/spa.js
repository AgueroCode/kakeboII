const categorias = {
    CU: 'Cultura',
    SU: 'Supervivencia',
    OV: 'Ocio-vicio',
    EX: 'Extra'
}

let losMovimientos

function recibeRespuesta() {
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en acceso a servidor " + respuesta.mensaje)
            return
        }

        llamaApiMovimientos()
    }
}

function detallaMovimiento(id) {
    let movimiento
    for (let i=0; i<losMovimientos.length; i++) {
        const item = losMovimientos[i]
        if (item.id == id) {
            movimiento = item
            break
        // bucle de busqueda clasico
        }
    }

    if (!movimiento) return

    document.querySelector("#idMovimiento").value = id
    document.querySelector("#fecha").value = movimiento.fecha
    document.querySelector("#concepto").value = movimiento.concepto
    document.querySelector("#categoria").value = movimiento.categoria
    document.querySelector("#cantidad").value = movimiento.cantidad.toFixed(2)
    if (movimiento.esGasto == 1) {
        document.querySelector("#gasto").checked = true
    } else {
        document.querySelector("#ingreso").checked = true
    }
}

function muestraMovimientos() {
    if (this.readyState === 4 && this.status === 200) {
        const respuesta = JSON.parse(this.responseText)

        if (respuesta.status !== 'success') {
            alert("Se ha producido un error en la consulta de movimientos")
            return
        }
        // ASI TENEMOS GUARDADOS LOS MOVIMIENTOS PARA LUeGO
        losMovimientos = respuesta.movimientos
        const tbody = document.querySelector(".tabla-movimientos tbody")
        tbody.innerHTML = ""

        for (let i = 0; i < respuesta.movimientos.length; i++) {
            const movimiento = respuesta.movimientos[i]
            const fila = document.createElement("tr")
            fila.addEventListener("click", () => detallaMovimiento(movimiento.id))

            const dentro = `
                <td>${movimiento.fecha}</td>
                <td>${movimiento.concepto}</td>
                <td>${movimiento.esGasto ? "Gasto" : "Ingreso"}</td>
                <td>${movimiento.categoria ? categorias[movimiento.categoria] : ""}</td>
                <td>${movimiento.cantidad} €</td>
            `
            fila.innerHTML = dentro

            tbody.appendChild(fila)
        }
    }
}

xhr = new XMLHttpRequest()

function llamaApiMovimientos() {
    xhr.open('GET', `http://localhost:5000/api/v1/movimientos`, true)
    xhr.onload = muestraMovimientos
    xhr.send()
}

// esto es para que el js se ejecute solo cuando la pagaina acabe de cargarse
window.onload = function() {
    llamaApiMovimientos()

    document.querySelector("#modificar")
        .addEventListener("click", (ev) => {
            ev.preventDefault()
            const movimiento = {}
            movimiento.fecha = document.querySelector("#fecha").value
            movimiento.concepto = document.querySelector("#concepto").value
            movimiento.categoria = document.querySelector("#categoria").value
            movimiento.cantidad = document.querySelector("#cantidad").value
            if (document.querySelector("#gasto").checked) {
                movimiento.esGasto = 1            
            } else {
                movimiento.esGasto = 0
            }
            id = document.querySelector("#idMovimiento").value
            xhr.open("PUT", `http://localhost:5000/api/v1/movimiento/${id}`, true)
            xhr.onload = recibeRespuesta

            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8")

            // stringify coge una objeto js y lo convierte en un texto que viaja, es lo contrario que el parse
            xhr.send(JSON.stringify(movimiento))
        })
}