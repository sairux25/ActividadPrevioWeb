// URL de la API. La levanta json-server cuando corres `npm run api`.
const API_URL = 'http://localhost:3000/tickets';

// Estado de la aplicación: la lista de tickets tal como la conoce el navegador.
// La pantalla siempre se dibuja a partir de este arreglo.
let tickets = [];

// Tu código empieza aquí.
const tituloFormulario=document.querySelector("#titulo-formulario");
const listaTickets=document.querySelector("#lista-tickets");
const mensaje=document.querySelector("#mensaje");
const errorTitulo=document.querySelector("#error-titulo");
const errorSolicitante=document.querySelector("#error-solicitante");
const botonGuardar=document.querySelector("#btn-guardar");
const formulario=document.querySelector("#form-ticket");
const inputTitulo = document.querySelector("#titulo");
const inputSolicitante = document.querySelector("#solicitante");
const inputDescripcion=document.querySelector("#descripcion");
const inputCategoria=document.querySelector("#categoria");
const inputPrioridad=document.querySelector("#prioridad");
const botonCancelar=document.querySelector("#btn-cancelar");
let idEnEdicion=null;


const ESTADOS = {
  abierto: {
    etiqueta: "Abierto",
    clases: "bg-sky-100 text-sky-800",
    siguiente: "en_progreso",
    textoBoton: "Empezar",
  },
  en_progreso: {
    etiqueta: "En progreso",
    clases: "bg-amber-100 text-amber-800",
    siguiente: "resuelto",
    textoBoton: "Marcar resuelto",
  },
  resuelto: {
    etiqueta: "Resuelto",
    clases: "bg-emerald-100 text-emerald-800",
    siguiente: null,
    textoBoton: null,
  },
};
 
const PRIORIDADES = {
  baja: { etiqueta: "Prioridad baja", clases: "bg-slate-100 text-slate-700" },
  media: { etiqueta: "Prioridad media", clases: "bg-indigo-100 text-indigo-800" },
  alta: { etiqueta: "Prioridad alta", clases: "bg-rose-100 text-rose-800" },
};
 
const CATEGORIAS = {
  hardware: "Hardware",
  software: "Software",
  red: "Red",
  accesos: "Accesos",
};

async function listarTickets(){
    mensaje.textContent="Cargando";
  try{
    const respuesta= await fetch(API_URL);
    if(!respuesta.ok){
      throw new Error(`La API respondió ${respuesta.status}`);
    }

    tickets= await respuesta.json();
    mensaje.textContent="";

    pintarTickets();

  }catch(error){
    mensaje.textContent = "No se pudieron cargar los tickets desde "+ API_URL +". Revisa que la API esté corriendo con npm run api." + error.message;
  }
}

function pintarTickets() {
  listaTickets.innerHTML = "";
 
  if (tickets.length === 0) {
    mensaje.textContent = "Todavía no hay tickets. Crea el primero con el formulario.";
    return;
  }
  tickets.forEach((ticket) => {
    listaTickets.appendChild(crearTarjeta(ticket));
  });
}

function crearTarjeta(ticket) {
    const datoEstado=ESTADOS[ticket.estado];

    const tarjeta = document.createElement("article");
    tarjeta.className = "rounded-lg border border-slate-200 p-4";
    
    const titulo = document.createElement("h3");
    titulo.className = "font-semibold";
    titulo.textContent = `#${ticket.id} ${ticket.titulo}`;
    
    const descripcion = document.createElement("p");
    descripcion.className = "text-sm text-slate-600 mt-1";
    descripcion.textContent = ticket.descripcion;
    
    const solicitante = document.createElement("p");
    solicitante.className = "text-sm text-slate-500 mt-2";
    solicitante.textContent = `Solicitante: ${ticket.solicitante}`;
    
    const categoria = document.createElement("p");
    categoria.className = "text-sm text-slate-500";
    categoria.textContent = `Categoría: ${CATEGORIAS[ticket.categoria]}`;
    
    const etiquetas = document.createElement("div");
    etiquetas.className = "flex gap-2 mt-3";
    etiquetas.appendChild(crearEtiqueta(PRIORIDADES[ticket.prioridad]));
    etiquetas.appendChild(crearEtiqueta(ESTADOS[ticket.estado]));
    
    tarjeta.appendChild(titulo);
    tarjeta.appendChild(descripcion);
    tarjeta.appendChild(solicitante);
    tarjeta.appendChild(categoria);
    tarjeta.appendChild(etiquetas);
    
    const botones= document.createElement("div");
    botones.className="flex gap-2 mt-3";

    const botonEditar=document.createElement("button");
    botonEditar.type="button";
    botonEditar.className="rounded-md bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700";
    

    if(datoEstado.siguiente){
        const botonSiguienteEstado=document.createElement("button");
        botonSiguienteEstado.type="button";
        botonSiguienteEstado.className="rounded-md bg-sky-600 px-3 py-1 text-sm font-medium text-white hover:bg-sky-700";
        botonSiguienteEstado.textContent = datoEstado.textoBoton;

        botonSiguienteEstado.addEventListener("click", () => avanzarEstado(ticket, botonSiguienteEstado));
 
        botones.appendChild(botonSiguienteEstado);
        tarjeta.appendChild(botones);
    }


    return tarjeta;
}


function editarTicket (ticket){
  tituloFormulario.textContent=`Editar ticket #${ticket.id}`;
  inputTitulo.value=ticket.titulo;
  inputDescripcion.value=ticket.descripcion;
  inputSolicitante.value=ticket.solicitante;
  inputCategoria.value= ticket.categoria;
  inputPrioridad.value=ticket.prioridad;
  botonGuardar.textContent="Guardar cambios";
  botonCancelar.hidden=false;
  idEnEdicion=ticket.id;
}


function volverModoCreacion(){
  formulario.reset();

  idEnEdicion=null;
  tituloFormulario.textContent="Nuevo ticket";
  botonGuardar.textContent="Crear ticket";
  botonCancelar.hidden=true
}


function crearEtiqueta(dato) {
  const span = document.createElement("span");
  span.className = `px-2 py-1 rounded text-xs font-medium ${dato.clases}`;
  span.textContent = dato.etiqueta;
  return span;
}


async function avanzarEstado(ticket,boton) {
    const siguiente=ESTADOS[ticket.estado].siguiente;
    boton.disabled=true;
    try{
        const respuesta= await fetch(`${API_URL}/${ticket.id}`,{
            method:"PATCH",
            headers:{"content-Type":"application/json"},
            body: JSON.stringify({estado:siguiente}),
        });

        if(!respuesta.ok){
            throw new Error(`La API respondió ${respuesta.status}`);
        }

        const ticketActualizado= await respuesta.json();
        const indice = tickets.findIndex((t) => t.id === ticket.id);
        tickets[indice] = ticketActualizado;
 
        pintarTickets();
    } catch (error) {
        console.error("Falló el PATCH del ticket", ticket.id, error);
        boton.disabled = false;
    }

}   

function validarFormulario(){
    let valido=true;

    errorSolicitante.textContent="";
    errorTitulo.textContent="";

    if(inputTitulo.value.trim().length<5){
        errorTitulo.textContent="El título debe tener al menos 5 caracteres.";
        valido=false;
    }

    if(inputSolicitante.value.trim().length===" "){
        errorSolicitante.textContent="Debe escribir quien reporta el ticket";
        valido=false;
    }
    return valido;
}

formulario.addEventListener("submit", async(e) =>{
    e.preventDefault();
 
    if (!validarFormulario()) {
    return;
    }
    const nuevoTicket = {
        titulo: inputTitulo.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        solicitante: inputSolicitante.value.trim(),
        categoria: inputCategoria.value,
        prioridad: inputPrioridad.value,
        estado: "abierto",
    };

    botonGuardar.disabled = true;

    try{
        const respuesta= await fetch(API_URL, {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify(nuevoTicket),
        });

        if(!respuesta.ok){
            throw new Error(`La API respondió ${respuesta.status}`);
        }

        const ticketCreado = await respuesta.json();
        tickets.push(ticketCreado);

        pintarTickets();
        formulario.reset();
    }catch{
        console.error("Falló el POST a", API_URL, error);   
    }finally{
        botonGuardar=false;
    }
});

inputTitulo.addEventListener("input", () => {
  if (inputTitulo.value.trim().length >= 5) {
    errorTitulo.textContent = "";
  }
});
 
inputSolicitante.addEventListener("input", () => {
  if (inputSolicitante.value.trim() !== "") {
    errorSolicitante.textContent = "";
  }
});


listarTickets();