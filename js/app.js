const criptomonedasSelect = document.querySelector('#criptomonedas');
const monedaSelect = document.querySelector('#moneda');
const formulario = document.querySelector('#formulario');
const resultado = document.querySelector('#resultado');
const ultimasBusqueda = document.querySelector('#ultimasBusquedas')
const objBusqueda = {
    moneda: '',
    criptomoneda: ''
}
let criptos = [];

//Crear un Promise
const obtenerCriptomonedas = criptomonedas => new Promise (resolve => {
    resolve(criptomonedas);
});

document.addEventListener('DOMContentLoaded', ()=>{
    consultarCriptomonedas();
    formulario.addEventListener('submit', submitFormulario);
    criptomonedasSelect.addEventListener('change', leerValor);
    monedaSelect.addEventListener('change', leerValor);

    criptos = JSON.parse(localStorage.getItem('criptos')) || [];
    ultimasBusquedas()
});

async function consultarCriptomonedas(){
    const url = 'https://min-api.cryptocompare.com/data/top/mktcapfull?limit=15&tsym=USD';

        try {
            const respuesta = await fetch(url);
            const resultado = await respuesta.json();
            const criptomonedas = await obtenerCriptomonedas(resultado.Data);
            selectCriptomonedas(criptomonedas);

        } catch (error) {
            console.log(error);
        }
};

function selectCriptomonedas(criptomonedas){

    criptomonedas.forEach(cripto => {
        const {FullName, Name} = cripto.CoinInfo

        const option = document.createElement('option')
        option.value = Name;
        option.textContent = FullName;
        criptomonedasSelect.appendChild(option);
    });
};
function leerValor(e){
    objBusqueda[e.target.name] = e.target.value;
};

function submitFormulario(e){
    e.preventDefault();

    const {moneda, criptomoneda} = objBusqueda;
    if(moneda === '' || criptomoneda === ''){
        mostrarAlerta('Ambos campos son obligatorios');
        return
    };

    Toastify({
        text: "Cotizando criptomonedas... ⌛️",
        className: "info",
        duration: 2400,
        style: {
          background: "#187498",
          color:"#EFEFEF",
          fontSize: "1.5rem",
          textAlign: "center",
          fontWeight: "bold",
          width: "350px",
        }
      }).showToast();
    //Consultar API con los resultados!
    setTimeout(() => {
        consultarAPI();
        Toastify({
            text: "Criptomoneda Cotizada ✅",
            className: "info",
            duration: 2500,
            style: {
              background: "#36AE7C",
              color:"#fff",
              fontSize: "1.5rem",
              textAlign: "center",
              fontWeight: "bold",
              width: "350px",
            }
          }).showToast();
    }, 2500);

    formulario.reset()
};

function mostrarAlerta(mensaje){
    const existeError = document.querySelector('.error')

    if(!existeError){
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('error');
        divMensaje.textContent = mensaje;
        formulario.appendChild(divMensaje);
        setTimeout(() => {
            divMensaje.remove()
        }, 3000);
    };
};

async function consultarAPI(){
    const {moneda, criptomoneda} = objBusqueda;

    const url = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${criptomoneda}&tsyms=${moneda}`;

        try {
            const respuesta = await fetch(url);
            const cotizacion = await respuesta.json();
            imprimirHTML(cotizacion.RAW[criptomoneda][moneda]);
            llenarObjeto(cotizacion.RAW[criptomoneda][moneda]);
        } catch (error) {
            console.log(error)
        }
        
    };
    
    function imprimirHTML(cotizacion){
    limpiarHTML();
    llenarObjeto(cotizacion)
    const {FROMSYMBOL,TOSYMBOL, PRICE, HIGHDAY,LOWDAY,CHANGEPCT24HOUR,LASTUPDATE} = cotizacion;
    

    const nombre = document.createElement('p');
    nombre.innerHTML = `<p> Nombre de criptomoneda: <span> ${FROMSYMBOL} </span>`;
    const nombreDos = document.createElement('p');
    nombreDos.innerHTML = `<p> Nombre de Moneda Fiat: <span> ${TOSYMBOL} </span>`;
    const precio = document.createElement('p');
    precio.classList.add('precio');
    precio.innerHTML = `El precio es: <span> $${financial(PRICE)} </span>`;

    const precioAlto = document.createElement('p');
    precioAlto.innerHTML = `<p> Precio mas alto del dia: <span> $${financial(HIGHDAY)} </span>`;

    const precioBajo = document.createElement('p');
    precioBajo.innerHTML = `<p> Precio mas bajo del dia: <span> $${financial(LOWDAY)} </span>`;

    const ultimasHoras = document.createElement('p');
    ultimasHoras.innerHTML = `<p>Variacion ultimas 24 horas: <span id="change"> ${financial(CHANGEPCT24HOUR)}% </span>`;

    resultado.appendChild(nombre);
    resultado.appendChild(nombreDos);
    resultado.appendChild(precio);
    resultado.appendChild(precioAlto);
    resultado.appendChild(precioBajo);
    resultado.appendChild(ultimasHoras);

    const change = document.querySelector('#change');
    if(CHANGEPCT24HOUR >= 0){
        change.classList.add('positivo');
    }else{
        change.classList.add('negativo');
    };
};

function limpiarHTML(){
    while(resultado.firstChild){
        resultado.removeChild(resultado.firstChild)
    };
};
function financial(x) {
    return Number.parseFloat(x).toFixed(2);
  };




function llenarObjeto(cotizacion){
    const {FROMSYMBOL,TOSYMBOL, PRICE, HIGHDAY,LOWDAY,CHANGEPCT24HOUR,LASTUPDATE} = cotizacion;
    // objCripto.name = cotizacion.RAW[criptomoneda][moneda].FROMSYMBOL

    const objCripto = {
    name: FROMSYMBOL,
    namefiat: TOSYMBOL,
    price: PRICE,
    highday: HIGHDAY,
    lowday: LOWDAY,
    charge: CHANGEPCT24HOUR,
    lastupdate: LASTUPDATE
    };

    criptos = [...criptos, objCripto];
    ultimasBusquedas(criptos)
};

function sincronizarStorage(){
    localStorage.setItem('criptos', JSON.stringify(criptos))

};




function ultimasBusquedas(){

    limpiarBusquedas();

    criptos.forEach(cripto =>{

        const {name, namefiat, price, highday, lowday,charge} = cripto
        ultimasBusqueda.classList.add('ultbs')
        ultimasBusqueda.innerHTML = `
        <div>
            Ultimo par buscado: <span>${name}/${namefiat} </span>
        </div>
        <div>
            El precio es: <span> $${financial(price) } </span>
        </div>
        <div>
            Precio mas alto del dia: <span> $${ financial(highday) } </span>
        </div>
        <div>
            Precio mas bajo del dia: <span> $${financial(lowday) } </span>
        </div>
        <div>
            Variacion ultimas 24 horas: <span id="change"> ${financial(charge)}% </span>
        </div>
        `
        const change = document.querySelector('#change');
        if(charge >= 0){
            change.classList.add('positivo');
        }else{
            change.classList.add('negativo');
        };
    });

     sincronizarStorage()
};


function limpiarBusquedas(){
    while(ultimasBusqueda.firstChild){
        ultimasBusqueda.removeChild(ultimasBusqueda.firstChild)
    };
};