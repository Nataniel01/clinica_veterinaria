const ESTANTES_INICIALES = ["1 <1", "1 <2", "6 >1", "General"];

const EJEMPLOS_EXCEL = [
    {
        id: 1,
        nombre: "Tintura de yodo",
        principio: "Yodo 2%",
        categoria: "Antiséptico",
        estante: "6 >1",
        especie: "Varias",
        indicaciones: "Antiséptico de la piel, desinfección de heridas",
        dosis: "Según necesidad",
        via: "Tópica",
        contraindicaciones: "",
        retiro: "No requiere",
        observaciones: "Uso externo únicamente",
        cantidad: 10,
        precio: 8
    },
    {
        id: 2,
        nombre: "Alert Vet",
        principio: "Triamcinolona, Clorfeniramina",
        categoria: "Antiinflamatorio",
        estante: "6 >1",
        especie: "Caninos y Felinos",
        indicaciones: "Tratamiento de alergias y prurito",
        dosis: "1 Compr/20kg",
        via: "Oral",
        contraindicaciones: "No usar en hembras gestantes",
        retiro: "N/A",
        observaciones: "",
        cantidad: 5,
        precio: 5
    }
];

let inventario = JSON.parse(localStorage.getItem('vet_sucre_vfinal')) || EJEMPLOS_EXCEL;
let estantes = JSON.parse(localStorage.getItem('estantes_sucre_vfinal')) || ESTANTES_INICIALES;
let idMedAMover = null;

document.addEventListener('DOMContentLoaded', () => {
    actualizarOpcionesEstantes();
    renderizarTodo();
});

function guardarTodo() {
    localStorage.setItem('vet_sucre_vfinal', JSON.stringify(inventario));
    localStorage.setItem('estantes_sucre_vfinal', JSON.stringify(estantes));
}


function crearEstante() {
    const input = document.getElementById('nombreEstante');
    const nombre = input.value.trim();
    if (nombre && !estantes.includes(nombre)) {
        estantes.push(nombre);
        guardarTodo();
        actualizarOpcionesEstantes();
        renderizarTodo();
        input.value = '';
    }
}

function actualizarOpcionesEstantes() {
    const selects = ['selectEstante', 'selectBorrarEstante', 'selectNuevoEstante'];
    const html = estantes.map(e => `<option value="${e}">${e}</option>`).join('');
    
    selects.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = html;
    });
}

function borrarEstante() {
    const estante = document.getElementById('selectBorrarEstante').value;
    if (inventario.some(m => m.estante === estante)) {
        alert("Error: El estante tiene medicamentos. Muévelos antes de borrarlo.");
        return;
    }
    if (confirm(`¿Eliminar estante ${estante}?`)) {
        estantes = estantes.filter(e => e !== estante);
        guardarTodo();
        actualizarOpcionesEstantes();
        renderizarTodo();
    }
}


function abrirModalMover(id, nombre) {
    idMedAMover = id;
    document.getElementById('nombreMedAMover').innerText = "Mover: " + nombre;
    document.getElementById('modalMover').style.display = "flex";
}

function cerrarModal() {
    document.getElementById('modalMover').style.display = "none";
    idMedAMover = null;
}

function confirmarMovimiento() {
    const nuevoEstante = document.getElementById('selectNuevoEstante').value;
    inventario = inventario.map(m => {
        if (m.id === idMedAMover) return { ...m, estante: nuevoEstante };
        return m;
    });
    guardarTodo();
    renderizarTodo();
    cerrarModal();
}


function agregarMedicamento() {
    const nuevo = {
        id: Date.now(),
        nombre: document.getElementById('nombre').value.trim(),
        principio: document.getElementById('principio').value.trim(),
        categoria: document.getElementById('categoria').value.trim(),
        estante: document.getElementById('selectEstante').value,
        especie: document.getElementById('especie').value.trim(),
        indicaciones: document.getElementById('indicaciones').value.trim(),
        dosis: document.getElementById('dosis').value.trim(),
        via: document.getElementById('via').value.trim(),
        contraindicaciones: document.getElementById('contraindicaciones').value.trim(),
        retiro: document.getElementById('retiro').value.trim(),
        observaciones: document.getElementById('observaciones').value.trim(),
        cantidad: document.getElementById('cantidad').value || 0,
        precio: document.getElementById('precio').value || 0
    };

    if (!nuevo.nombre) return alert("El nombre comercial es obligatorio.");

    inventario.push(nuevo);
    guardarTodo();
    limpiarFormulario();
    renderizarTodo();
    alert("✅ Fármaco guardado.");
}

function eliminarMedicamento(id) {
    if (confirm("¿Seguro que deseas borrar este registro médico?")) {
        inventario = inventario.filter(m => m.id !== id);
        guardarTodo();
        renderizarTodo();
    }
}

function limpiarFormulario() {
    const ids = ['nombre', 'principio', 'categoria', 'especie', 'indicaciones', 'dosis', 'via', 'contraindicaciones', 'retiro', 'observaciones', 'cantidad', 'precio'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
}


function buscarMedicamento() {
    const filtro = document.getElementById('inputBuscar').value.toLowerCase();
    document.querySelectorAll('.estante-container').forEach(cont => {
        const tarjetas = cont.querySelectorAll('.med-card');
        let encontrados = 0;
        tarjetas.forEach(card => {
            const contenido = card.innerText.toLowerCase();
            if (contenido.includes(filtro)) {
                card.style.display = "";
                encontrados++;
            } else {
                card.style.display = "none";
            }
        });
        cont.style.display = encontrados > 0 ? "" : "none";
    });
}

function renderizarTodo() {
    const contenedor = document.getElementById('contenedorEstantes');
    if(!contenedor) return;
    contenedor.innerHTML = '';

    [...estantes].sort().forEach(est => {
        const lista = inventario.filter(m => m.estante === est);
        
        // No mostrar estantes vacíos si hay una búsqueda activa
        if (lista.length === 0 && document.getElementById('inputBuscar').value !== "") return;

        const divEstante = document.createElement('div');
        divEstante.className = 'estante-container';
        divEstante.innerHTML = `
            <h2 class="estante-title">📍 Ubicación: ${est} <small>(${lista.length})</small></h2>
            <div class="med-grid">
                ${lista.length > 0 ? lista.map(m => `
                    <div class="med-card">
                        <div class="tag-categoria">${m.categoria || 'Sin Categoría'}</div>
                        <div class="med-name">${m.nombre}</div>
                        <div class="med-principio">🧪 ${m.principio}</div>
                        
                        <div class="med-info-box">
                            <p><strong>🐾 Especie:</strong> ${m.especie}</p>
                            <p><strong>📋 Dosis:</strong> ${m.dosis} (${m.via})</p>
                            ${m.indicaciones ? `<p><strong>💡 Ind:</strong> ${m.indicaciones}</p>` : ''}
                            ${m.contraindicaciones ? `<p class="warning-text"><strong>🚫 Contraind:</strong> ${m.contraindicaciones}</p>` : ''}
                            ${m.retiro ? `<p><strong>⏳ Retiro:</strong> ${m.retiro}</p>` : ''}
                            ${m.observaciones ? `<p class="obs-text"><strong>📝 Nota:</strong> ${m.observaciones}</p>` : ''}
                        </div>

                        <div class="med-footer">
                            <span class="stock">Stock: ${m.cantidad}</span>
                            <span class="precio">Bs. ${m.precio}</span>
                        </div>
                        <div class="card-actions">
                            <button class="btn-move" onclick="abrirModalMover(${m.id}, '${m.nombre}')">📦 Mover</button>
                            <button class="btn-danger-outline" onclick="eliminarMedicamento(${m.id})">Borrar</button>
                        </div>
                    </div>
                `).join('') : '<p class="estante-vacio">Estante vacío</p>'}
            </div>
        `;
        contenedor.appendChild(divEstante);
    });
}


function generarReporte() {
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html><head><title>Reporte Clínica Sucre</title>
        <style>
            body{font-family:sans-serif;padding:20px} 
            table{width:100%;border-collapse:collapse;margin-top:20px} 
            th,td{border:1px solid #ddd;padding:10px;text-align:left} 
            th{background:#00bfa5;color:white}
            h1{color:#00897b}
        </style>
        </head><body>
        <h1>🐾 Reporte de Inventario - Clínica Sucre</h1>
        <p>Fecha: ${new Date().toLocaleDateString()}</p>
        <table>
            <tr><th>Medicina</th><th>Principio</th><th>Ubicación</th><th>Stock</th><th>Precio</th></tr>
            ${inventario.map(m => `<tr><td>${m.nombre}</td><td>${m.principio}</td><td>${m.estante}</td><td>${m.cantidad}</td><td>Bs. ${m.precio}</td></tr>`).join('')}
        </table>
        <script>window.print();</script>
        </body></html>
    `);
    ventana.document.close();
}

function exportarDatos() {
    const backup = JSON.stringify({ inventario, estantes });
    navigator.clipboard.writeText(backup).then(() => {
        alert("🚀 Código de respaldo copiado al portapapeles. Pégalo en WhatsApp o un Bloc de notas.");
    });
}

function importarDatos() {
    const code = prompt("Pega aquí el código de respaldo:");
    if (code) {
        try {
            const data = JSON.parse(code);
            if (data.inventario && data.estantes) {
                inventario = data.inventario;
                estantes = data.estantes;
                guardarTodo();
                location.reload();
            } else {
                alert("❌ Formato de datos incorrecto.");
            }
        } catch(e) {
            alert("❌ Error al procesar el código.");
        }
    }
}