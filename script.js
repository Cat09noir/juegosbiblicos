let nombreJugador = "";
let puntaje = 0;
let puntajeMaximo = localStorage.getItem("puntajeMaximo") || 0;
let preguntas = [];
let indiceActual = 0;
let temporizador;
let tiempo = 15;

const barraProgreso = document.getElementById("barraTiempoProgreso");
const sonidoCorrecto = new Audio("assets/sonido_correcto.mp3");
const sonidoIncorrecto = new Audio("assets/sonido_incorrecto.mp3");

function iniciarJuego() {
    const inputNombre = document.getElementById("nombreJugador");
    if (!inputNombre.value.trim()) {
        alert("Por favor, ingresa tu nombre.");
        return;
    }
    nombreJugador = inputNombre.value.trim();
    cambiarPantalla("pantallaInicio", "pantallaJuego");
    document.getElementById("jugadorActual").innerText = `Jugador: ${nombreJugador}`;
    comenzarJuego();
}

function comenzarJuego() {
    fetch("preguntas_1000.json")
        .then(res => res.json())
        .then(data => {
            // Si el JSON es un arreglo (como en tu ejemplo) o está dentro de una propiedad:
            const preguntasArray = Array.isArray(data) ? data : data.preguntas;
            if (!Array.isArray(preguntasArray)) {
                throw new Error("La estructura del JSON es incorrecta.");
            }
            preguntas = preguntasArray.sort(() => Math.random() - 0.5).slice(0, 10);
            indiceActual = 0;
            puntaje = 0;
            mostrarPregunta();
        })
        .catch(error => {
            console.error("Error al cargar preguntas:", error);
            alert("Hubo un problema al cargar las preguntas.");
        });
}

function mostrarPregunta() {
    clearInterval(temporizador);
    tiempo = 15;

    const preguntaActual = preguntas[indiceActual];
    document.getElementById("pregunta").innerText = preguntaActual.pregunta;

    // Convertimos las opciones (objeto) a un arreglo usando las claves en el orden a, b, c, d
    const keys = ["a", "b", "c", "d"];
    const opcionesDiv = document.getElementById("opciones");
    opcionesDiv.innerHTML = "";

    keys.forEach(key => {
        const textoOpcion = preguntaActual.opciones[key];
        const boton = document.createElement("button");
        boton.innerText = textoOpcion;
        boton.classList.add("btn-opcion");
        // Pasamos la clave (letra) al verificar la respuesta
        boton.onclick = () => verificarRespuesta(key);
        opcionesDiv.appendChild(boton);
    });

    document.getElementById("resultado").innerText = "";
    document.getElementById("puntaje").innerText = `Puntaje: ${puntaje}`;
    document.getElementById("btnSiguiente").style.display = "none";

    // Reinicia la barra de tiempo
    barraProgreso.style.width = "100%";
    temporizador = setInterval(() => {
        tiempo--;
        barraProgreso.style.width = `${(tiempo / 15) * 100}%`;
        if (tiempo <= 0) {
            clearInterval(temporizador);
            verificarRespuesta(null); // indicamos que el tiempo se agotó
        }
    }, 1000);
}

function verificarRespuesta(opcionSeleccionada) {
    clearInterval(temporizador);
    const preguntaActual = preguntas[indiceActual];
    const correcta = preguntaActual.respuesta_correcta; // letra (por ejemplo, "b")
    const resultado = document.getElementById("resultado");

    if (opcionSeleccionada === correcta) {
        resultado.innerText = "✅ ¡Correcto!";
        resultado.className = "correcto fade-in";
        sonidoCorrecto.play();
        puntaje += 10;
    } else if (opcionSeleccionada === null) {
        resultado.innerText = `⏰ Tiempo agotado. La respuesta era: ${preguntaActual.opciones[correcta]}`;
        resultado.className = "incorrecto fade-in";
        sonidoIncorrecto.play();
    } else {
        resultado.innerText = `❌ Incorrecto. La respuesta era: ${preguntaActual.opciones[correcta]}`;
        resultado.className = "incorrecto fade-in";
        sonidoIncorrecto.play();
    }

    document.getElementById("puntaje").innerText = `Puntaje: ${puntaje}`;
    document.getElementById("btnSiguiente").style.display = "inline-block";

    // Deshabilita todos los botones de respuesta
    Array.from(document.getElementById("opciones").children).forEach(btn => btn.disabled = true);
}

function siguientePregunta() {
    indiceActual++;
    if (indiceActual < preguntas.length) {
        mostrarPregunta();
    } else {
        mostrarPantallaFinal();
    }
}

function mostrarPantallaFinal() {
    document.getElementById("pantallaJuego").classList.remove("activa");
    document.getElementById("pantallaFinal").classList.add("activa");

    if (puntaje > puntajeMaximo) {
        puntajeMaximo = puntaje;
        localStorage.setItem("puntajeMaximo", puntajeMaximo);
    }

    document.getElementById("puntajeMaximo").innerText = `🏆 Puntaje más alto: ${puntajeMaximo}`;
    document.getElementById("resumenFinal").innerText = `${nombreJugador}, tu puntaje final fue: ${puntaje}`;

    let listaPuntajes = JSON.parse(localStorage.getItem("puntajesUsuarios")) || [];
    listaPuntajes.push({ nombre: nombreJugador, puntaje: puntaje });
    localStorage.setItem("puntajesUsuarios", JSON.stringify(listaPuntajes));

    mostrarEstrellas(puntaje);
    mostrarRanking();
}

function mostrarRanking() {
    const contenedorRanking = document.getElementById("rankingJugadores");
    contenedorRanking.innerHTML = "<h3>🏅 Ranking de jugadores:</h3>";

    let lista = JSON.parse(localStorage.getItem("puntajesUsuarios")) || [];
    lista.sort((a, b) => b.puntaje - a.puntaje);

    let listaHTML = "<ol>";
    lista.forEach(j => {
        listaHTML += `<li>${j.nombre} - ${j.puntaje} puntos</li>`;
    });
    listaHTML += "</ol>";

    contenedorRanking.innerHTML += listaHTML;
}

function cambiarPantalla(idAnterior, idNueva) {
    document.getElementById(idAnterior).classList.remove("activa");
    document.getElementById(idNueva).classList.add("activa");
}

function reiniciarJuego() {
    location.reload();
}

function mostrarEstrellas(puntaje) {
    const estrellasDiv = document.getElementById("estrellasFinales");
    estrellasDiv.innerHTML = "";
    const estrellas = Math.floor(puntaje / 30);
    for (let i = 0; i < estrellas; i++) {
        const estrella = document.createElement("span");
        estrella.innerText = "⭐";
        estrellasDiv.appendChild(estrella);
    }
}
