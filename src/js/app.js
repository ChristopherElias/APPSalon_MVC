let paso = 1;
let pasoInicial = 1;
let pasoFinal = 3;

const cita = {
    id: '',
    nombre: '',
    fecha: '',
    hora: '',
    servicios: []
}

document.addEventListener('DOMContentLoaded', function(){
    iniciarApp();
});


function iniciarApp(){
    mostrarSeccion(); //Muestra y oculta las secciones
    tabs();
    botonesPaginador(); //Agrega o quita los botones del paginador
    paginaSiguiente();
    paginaAnterior();

    consultarAPI(); //Consulta la API en el backend 
    idCliente();
    nombreCliente();//Añade el nombre del cliente al objeto cita
    seleccionarFecha(); //Añade la fecha de la cita  al objeto cita
    seleccionarHora(); //Añade la hora de la cita  al objeto cita

    mostrarResumen(); //Muestra el resumen de la cita
}

function mostrarSeccion(){

    //Ocultar la seccion que tenga la clase mostrar
    const seccionAnterior = document.querySelector('.mostrar');
    if(seccionAnterior){
        seccionAnterior.classList.remove('mostrar');
    }

    //Selecciona la seccion con el paso
    const pasoSelector = '#paso-' + paso;
    const seccion = document.querySelector(pasoSelector);
    seccion.classList.add('mostrar');


    //Quita la clase actual al tab anterior
    const tabAnterior = document.querySelector('.actual');
    if(tabAnterior){
        tabAnterior.classList.remove('actual');
    }

    //Resalta el tab actual
    const tab = document.querySelector('[data-paso="' + paso + '"]');
    tab.classList.add('actual');
}

function tabs(){
    const botones = document.querySelectorAll('.tabs button');

    botones.forEach( boton => {
        boton.addEventListener('click', function(e){    
            e.preventDefault();

            paso = parseInt(e.target.dataset.paso);
            mostrarSeccion();
            botonesPaginador();
        });
    });
}

function botonesPaginador(){
    const paginaAnterior = document.querySelector('#anterior');
    const paginaSiguiente = document.querySelector('#siguiente');

    if(paso === 1){
        paginaAnterior.classList.add('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }else if(paso === 3){
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.add('ocultar');

        mostrarResumen();
    }else{
        paginaAnterior.classList.remove('ocultar');
        paginaSiguiente.classList.remove('ocultar');
    }

    mostrarSeccion();
}

function paginaAnterior(){
    const paginaAnterior = document.querySelector('#anterior');
    paginaAnterior.addEventListener('click', function(){

        if(paso <= pasoInicial) return;
        paso--;

        botonesPaginador();

    });
}

function paginaSiguiente(){
    const paginaSiguiente = document.querySelector('#siguiente');
    paginaSiguiente.addEventListener('click', function(){

        if(paso >= pasoFinal) return;
        paso++;

        botonesPaginador();

    });
}




async function consultarAPI(){

    try {

        const url = `${location.origin}/api/servicios`;
        const resultado = await fetch(url);
        const servicios = await resultado.json();
        mostrarServicios(servicios);

    } catch (error){
        console.log(error);
    }

}

function mostrarServicios(servicios){

    //Itera todos los servicios obtenidos por la API, creando los elementos html para cada servicio
    servicios.forEach( servicio => {
        const { id, nombre, precio } = servicio;

        const nombreServicio = document.createElement('P'); //Se crea el elemento p (parrafo)
        nombreServicio.classList.add('nombre-servicio');    //Se le agrega una clase con el nombre
        nombreServicio.textContent = nombre;                //Se le agrega el nombre del servicio

        //Igual pero con el precio
        const precioServicio = document.createElement('P'); 
        precioServicio.classList.add('precio-servicio');
        precioServicio.textContent = '$ ' + precio;

        const servicioDiv = document.createElement('DIV'); //Se crea el elemento div
        servicioDiv.classList.add('servicio');             //Se le agrega una clase servicio
        
        //Dataset se encarga de crear atributos html, quedaria data-id-servicio como atributo en html
        //el ... = id es que ese atributo creado con dataset se obtiene como valor el id
        servicioDiv.dataset.idServicio = id;                

        //Se le asigna al evento click una funcion
        servicioDiv.onclick = function(){
            seleccionarServicio(servicio);
        };

        //Sirve para agregar elementos hijos al elemento padre, en este caso al DIV, 
        //teniendo al div como elemento padre
        servicioDiv.appendChild(nombreServicio);
        servicioDiv.appendChild(precioServicio);

        //Se le asigna al elemento principal servicios el Div creado con sus elementos hijos
        document.querySelector('#servicios').appendChild(servicioDiv);
    });
}

function seleccionarServicio(servicio){
    const { id } = servicio;
    const { servicios } = cita;

    //Identificar al elemento seleccionado del servicio
    const divServicio = document.querySelector('[data-id-servicio="' + id + '"]');

    //Comprobar si un servicio fue agregado o quitado
    if( servicios.some( agregado => agregado.id === id ) ){
        cita.servicios = servicios.filter( agregado => agregado.id !== id );
        divServicio.classList.remove('seleccionado');
    }else{
        cita.servicios = [...servicios, servicio];
        divServicio.classList.add('seleccionado');
    }

}

function idCliente(){
    //Obtener el value del input que tiene el nombre del cliente
    const id = document.querySelector('#id').value; 

    //Pasarle el value a la variable cita para que lo almacene en memoria
    cita.id = id;
}

function nombreCliente(){
    //Obtener el value del input que tiene el nombre del cliente
    const nombre = document.querySelector('#nombre').value; 

    //Pasarle el value a la variable cita para que lo almacene en memoria
    cita.nombre = nombre;
}

function seleccionarFecha(){
    const inputFecha = document.querySelector('#fecha');
    inputFecha.addEventListener('input', function(e){

        //Sirve para saber que dia de la semana ha elegido el cliente
        //0 - Domingo / 1 - Lunes / 2 - Martes / ...
        const dia = new Date(e.target.value).getUTCDay();

        //Sirve para comprobar si elegio el sabado o domingo
        if( [6, 0].includes(dia) ){
            e.target.value = '';
            mostrarAlerta('Fines de semana no permitidos', 'error', '.formulario');
        }else{
            cita.fecha = e.target.value;
        }
    });
}

function seleccionarHora(){
    const inputHora = document.querySelector('#hora');
    inputHora.addEventListener('input', function(e){
        const horaCita = e.target.value;
        const hora = horaCita.split(':')[0];

        if(hora < 10 || hora > 18){
            mostrarAlerta('El negocio no está disponible a la hora seleccionada', 'error', '.formulario');
        }else{
            cita.hora = horaCita;
        }
    });
}

function mostrarAlerta(mensaje, tipo, elemento, desaparece = true){

    //Previene que no se muestren varias alertas
    const alertaPrevia = document.querySelector('.alerta');
    if(alertaPrevia){
        alertaPrevia.remove();
    }

    //Se crea el elemento que mostrará la alerta
    const alerta = document.createElement('DIV');
    alerta.textContent = mensaje;
    alerta.classList.add('alerta');
    alerta.classList.add(tipo);

    //Agregar el elemento dentro de la clase elemento
    const referencia = document.querySelector(elemento);
    referencia.appendChild(alerta);

    //Si es true realiza la accion
    if(desaparece){
        //Elimina la alerta de la pantalla
        setTimeout(() => {
            alerta.remove();
        }, 3000);
    }

}

function mostrarResumen(){
    const resumen = document.querySelector('.contenido-resumen');

    //Limpiar el contenido de Resumen
    while(resumen.firstChild){
        resumen.removeChild(resumen.firstChild);
    }

    //Verifica si el objeto cita tiene datos
    if(Object.values(cita).includes('') || cita.servicios.length == 0){
        mostrarAlerta('Faltan agregar datos o servicios', 'error', '.contenido-resumen', false);

        return;
    }


    //Formatear el div de resumen
    const { nombre, fecha, hora, servicios } = cita;


    //Heading para servicios en Resumen
    const headingServicios = document.createElement('H3');
    headingServicios.textContent = 'Resumen de Servicios';
    resumen.appendChild(headingServicios);


    //Iterando y mostrando los servicios
    servicios.forEach(servicio => {
        const { id, precio, nombre } = servicio;
        const contenedorServicio = document.createElement('DIV');
        contenedorServicio.classList.add('contenedor-servicio');

        const textoServicio = document.createElement('P');
        textoServicio.textContent = nombre;

        const precioServicio = document.createElement('P');
        precioServicio.innerHTML = '<span>Precio: </span> $ ' + precio;

        contenedorServicio.appendChild(textoServicio);
        contenedorServicio.appendChild(precioServicio);

        resumen.appendChild(contenedorServicio);
    });


    //Heading para cita en Resumen
    const headingCita = document.createElement('H3');
    headingCita.textContent = 'Resumen de Cita';
    resumen.appendChild(headingCita);


    const nombreCliente = document.createElement('P');
    nombreCliente.innerHTML = '<span>Nombre: </span>' + nombre;

    //Formatear la fecha en español
    const fechaObj = new Date(fecha);
    const mes = fechaObj.getMonth();
    const dia = fechaObj.getDate() + 2;
    const year = fechaObj.getFullYear();

    const fechaUTC = new Date(Date.UTC(year, mes, dia));

    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const fechaFormateada = fechaUTC.toLocaleDateString('es-ES', opciones);

    const fechaCita = document.createElement('P');
    fechaCita.innerHTML = '<span>Fecha: </span>' + fechaFormateada;

    const horaCita = document.createElement('P');
    horaCita.innerHTML = '<span>Hora: </span>' + hora + ' Horas';


    //Boton para crear una cita
    const botonReservar = document.createElement('BUTTON');
    botonReservar.classList.add('boton');
    botonReservar.textContent = 'Reservar Cita';
    botonReservar.onclick = reservarCita;

    resumen.appendChild(nombreCliente);
    resumen.appendChild(fechaCita);
    resumen.appendChild(horaCita);

    resumen.appendChild(botonReservar);
}

async function reservarCita(){

    const { nombre, fecha, hora, servicios, id } = cita;

    const idServicios = servicios.map( servicio => servicio.id );

    const datos = new FormData();
    datos.append('fecha', fecha);
    datos.append('hora', hora);
    datos.append('usuarioId', id);
    datos.append('servicios', idServicios);


    try{

        const url = `${location.origin}/api/citas`;

        const respuesta = await fetch(url, {
            method: 'POST',
            body: datos
        });
    
        const resultado = await respuesta.json(); //Se obtiene la respuesta de la api
        console.log(resultado.resultado);  
    
        //verificar el model ActiveRecord, del metodo crear donde se guardan los registros se tiene
        //un response con dos variables, el id del registro insertado y la respuesta que devuelve true o false
        // return [
        //     'resultado' =>  $resultado,
        //     'id' => self::$db->insert_id
        //  ];
    
        if(resultado.resultado){
            Swal.fire({
                icon: 'success',
                title: 'Cita Creada',
                text: 'Tu Cita fue creada correctamente',
                button: 'OK'
            }).then( () => {
            
                setTimeout( () => {
                    window.location.reload();
                }, 3000 );
    
            })
        }

    }catch (error){

        console.log(error);

        return;

        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error! ' + error
        })

    }

}