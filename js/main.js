//Arrays
import { productos } from './arrays.js'
import { bolsas } from './bolsas.js'

let marcasSeleccionadas = []//Marcas seleccionadas por el usuario en los filtros
let coloresSeleccionados = []//Colores seleccionados por el usuario en los filtros
let contenedor = document.querySelector('.contenedor')

document.addEventListener('DOMContentLoaded', () => mostrarProductos(productos, contenedor))//Muestra los productos despues de que se carga el dom

//Mostrar productos
function mostrarProductos(lista, contenedor) {
  contenedor.innerHTML = ''
  lista.forEach(producto => {
    let div = document.createElement('div')
    div.classList.add('tarjetas')
    div.innerHTML = `
      <div class="img-container">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <img src="${producto.imagen2}" alt="${producto.nombre}">
        <button onclick="agregarMeGusta(${producto.codigo})" class="btn-like" aria-label="Me gusta">♥</button>
      </div>
      <h1>${producto.nombre}</h1>
      <h2>$${producto.precio}</h2>
      <p>${producto.descripcion}</p>
        <img src="../media/body/header/estrella.png" alt="estrella" class="estrella-slider" />
      <button onclick="agregarCarrito(${producto.codigo})" class="btn-carrito">Agregar al carrito</button>
    `
    contenedor.appendChild(div)
  })
}

//Filtrado por marca
function filtroMarca(valor, checked) {
  if (checked) {
    if (!marcasSeleccionadas.includes(valor)) marcasSeleccionadas.push(valor)
  } else {
    marcasSeleccionadas = marcasSeleccionadas.filter(marca => marca !== valor)
  }
  aplicarFiltros()
}

//Filtrado por color
function filtroColor(valor, checked) {
  if (checked) {
    if (!coloresSeleccionados.includes(valor)) coloresSeleccionados.push(valor)
  } else {
    coloresSeleccionados = coloresSeleccionados.filter(color => color !== valor)
  }
  aplicarFiltros()
}

//Aplicar filtros
function aplicarFiltros() {
  const min = parseFloat(document.getElementById('precioMin')?.value || document.getElementById('precioMinMovil')?.value || '')
  const max = parseFloat(document.getElementById('precioMax')?.value || document.getElementById('precioMaxMovil')?.value || '')
  
  let resultados = productos.filter(producto =>
    (marcasSeleccionadas.length === 0 || marcasSeleccionadas.includes(producto.marca)) &&
    (coloresSeleccionados.length === 0 || coloresSeleccionados.includes(producto.color)) &&
    (isNaN(min) || producto.precio >= min) &&
    (isNaN(max) || producto.precio <= max)
  )
  
  const ordenarAsc = document.getElementById('precioAsc')?.checked || document.getElementById('precioAscMovil')?.checked
  const ordenarDesc = document.getElementById('precioDesc')?.checked || document.getElementById('precioDescMovil')?.checked
  const ordenarAZ = document.getElementById('nombreAZ')?.checked || document.getElementById('nombreAZMovil')?.checked
  const ordenarZA = document.getElementById('nombreZA')?.checked || document.getElementById('nombreZAMovil')?.checked

  resultados.sort((productoA, productoB) => {
    if (ordenarAZ) return productoA.nombre.localeCompare(productoB.nombre)
    if (ordenarZA) return productoB.nombre.localeCompare(productoA.nombre)
    if (ordenarAsc) return productoA.precio - productoB.precio
    if (ordenarDesc) return productoB.precio - productoA.precio
    return 0
  })

  if (resultados.length) mostrarProductos(resultados, contenedor)
  else contenedor.innerHTML = '<p class="no-result">! No se encontraron productos que cumplan con los filtros.</p>'
}

//Ordenamientos
function ordenamiento(idSeleccionado) {
  const checkboxSeleccionado = document.getElementById(idSeleccionado);
  const checkboxMovil = document.getElementById(idSeleccionado + 'Movil');
  const estabaActivo = checkboxSeleccionado?.checked || checkboxMovil?.checked;

  const grupos = {
    nombre: ['nombreAZ', 'nombreZA'],
    precio: ['precioAsc', 'precioDesc']
  };

  for (const grupo in grupos) {
    if (grupos[grupo].includes(idSeleccionado)) {
      grupos[grupo].forEach(id => {
        if (id !== idSeleccionado) {
          const checkbox = document.getElementById(id);
          const checkboxM = document.getElementById(id + 'Movil');
          if (checkbox) checkbox.checked = false;
          if (checkboxM) checkboxM.checked = false;
        }
      });
    }
  }

  if (checkboxSeleccionado) checkboxSeleccionado.checked = estabaActivo;
  if (checkboxMovil) checkboxMovil.checked = estabaActivo;
  aplicarFiltros();
}

//Buscador
function buscar() {
  let auxNombre = document.getElementById('nombre')?.value || document.getElementById('nombre-movil')?.value || '';
  auxNombre = auxNombre.toLowerCase();
  let auxResultado = document.querySelector('.contenedor');

  if (auxNombre === "") {
    mostrarProductos(productos, auxResultado);
    return;
  }

  auxResultado.innerHTML = '<p class="no-result">🔍︎ Buscando...</p>';

  new Promise((resolve, reject) => {
    if (!productos || productos.length === 0) {
      reject('<p class="no-result">! Api no encontrada</p>');
      return;
    }

    setTimeout(() => {
      const resultados = productos.filter(producto => {
        return (
          producto.nombre.toLowerCase().includes(auxNombre) ||
          producto.color.toLowerCase().includes(auxNombre) ||
          producto.marca.toLowerCase().includes(auxNombre)
        );
      });
      resultados.length > 0 ? resolve(resultados) : reject('<p class="no-result">! Error, producto no encontrado</p>');
    }, 1000);
  })
    .then((response) => {
      mostrarProductos(response, auxResultado);
    })
    .catch(error => {
      auxResultado.innerHTML = `<p class="no-result">${error}</p>`;
    });
}

//Submenu
function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  const titulo = document.querySelector(`.filtro-titulo[onclick*='${id}']`);
  if (!submenu || !titulo) return;
  const abierto = titulo.classList.toggle('abierto');
  submenu.style.display = abierto ? 'flex' : 'none';
}

//Borrar filtros
function limpiarFiltros() {
  marcasSeleccionadas = [];
  coloresSeleccionados = [];

  document.querySelectorAll('.filtro-marca').forEach(input => input.checked = false);
  document.querySelectorAll('.filtro-color').forEach(input => input.checked = false);
  
  const precioMin = document.getElementById('precioMin');
  const precioMax = document.getElementById('precioMax');
  const precioMinMovil = document.getElementById('precioMinMovil');
  const precioMaxMovil = document.getElementById('precioMaxMovil');
  
  if (precioMin) precioMin.value = '';
  if (precioMax) precioMax.value = '';
  if (precioMinMovil) precioMinMovil.value = '';
  if (precioMaxMovil) precioMaxMovil.value = '';
  
  ['precioAsc', 'precioDesc', 'nombreAZ', 'nombreZA'].forEach(id => {
    const checkbox = document.getElementById(id);
    const checkboxMovil = document.getElementById(id + 'Movil');
    if (checkbox) checkbox.checked = false;
    if (checkboxMovil) checkboxMovil.checked = false;
  });

  mostrarProductos(productos, contenedor);
}

//Menu
function toggleMenu() {
  const menu = document.getElementById('menuDrawer');
  if (!menu) return;
  menu.classList.toggle('open');
}

//Sidebar
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.elementos')
  const header = document.querySelector('.header')
  const footer = document.querySelector('footer')

  function ajustarSidebar() {
    if (!sidebar) return;
    const topSidebar = Math.max(header.getBoundingClientRect().bottom + 10, 10)
    const espacioFooter = footer.getBoundingClientRect().top - 30
    const altoVentana = window.innerHeight
    sidebar.style.top = `${topSidebar}px`
    sidebar.style.maxHeight = `${Math.min(espacioFooter - topSidebar, altoVentana - topSidebar - 10)}px`
  }

  window.addEventListener('scroll', ajustarSidebar)
  window.addEventListener('resize', ajustarSidebar)
  ajustarSidebar()
})

//Precio minimo y maximo
document.addEventListener('DOMContentLoaded', () => {
  const precioMin = document.getElementById('precioMin');
  const precioMax = document.getElementById('precioMax');
  const precioMinMovil = document.getElementById('precioMinMovil');
  const precioMaxMovil = document.getElementById('precioMaxMovil');
  
  if (precioMin) precioMin.addEventListener('input', aplicarFiltros);
  if (precioMax) precioMax.addEventListener('input', aplicarFiltros);
  if (precioMinMovil) precioMinMovil.addEventListener('input', aplicarFiltros);
  if (precioMaxMovil) precioMaxMovil.addEventListener('input', aplicarFiltros);
})

//Carrito
const carrito = []
function agregarCarrito(codigo) {
  const producto = [...productos, ...bolsas].find(i => i.codigo === codigo)
  if (producto) {
    carrito.push(producto)
    cantCarrito()
    formulario()
  }
}

function cantCarrito() {
  document.getElementById('contadorCarrito').textContent = carrito.length
}

function formulario() {
  let items = document.getElementById('listaMiniCarrito')
  mostrarMiniCarrito(carrito, items)
}

function verFormulario() {
  let ver = document.getElementById('miniCarrito')
  ver.style.display = ver.style.display === 'block' ? 'none' : 'block'
}

function mostrarMiniCarrito(lista, contenedor) {
  contenedor.innerHTML = ''
  lista.forEach((producto, index) => {
    let div = document.createElement('div')
    div.classList.add('item-carrito')
    div.innerHTML = `
      <div class="carritoItem">
        <div class="carrito-img-container">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <h1>${producto.nombre}</h1>
        <h2>$${producto.precio}</h2>
        <p>${producto.descripcion}</p>
        <button class="btnEliminar" onclick="eliminarCarrito(${index})">❌</button>
      </div>
    `
    contenedor.appendChild(div)
  })
}

function eliminarCarrito(index) {
  carrito.splice(index, 1)
  cantCarrito()
  formulario()
}

document.addEventListener('DOMContentLoaded', () => {
  const btnVaciarCarrito = document.getElementById('btnVaciarCarrito');
  if (btnVaciarCarrito) btnVaciarCarrito.addEventListener('click', vaciarCarrito);
})

function vaciarCarrito() {
  carrito.length = 0
  cantCarrito()
  formulario()
}

//Favoritos
const favoritos = []
function agregarMeGusta(codigo) {
  const yaExiste = favoritos.some(p => p.codigo === codigo)
  if (yaExiste) return

  const producto = [...productos, ...bolsas].find(i => i.codigo === codigo)
  if (producto) {
    favoritos.push(producto)
    cantFavorito()
    formularioFavorito()
  }
}


function cantFavorito() {
  document.getElementById('contadorFavorito').textContent = favoritos.length
}

function formularioFavorito() {
  let items = document.getElementById('listaFavorito')
  mostrarFavorito(favoritos, items)
}

function verFormularioFavorito() {
  let ver = document.getElementById('favorito')
  ver.style.display = ver.style.display === 'block' ? 'none' : 'block'
}

function mostrarFavorito(lista, contenedor) {
  contenedor.innerHTML = ''
  lista.forEach((producto, index) => {
    let div = document.createElement('div')
    div.classList.add('item-favorito')
    div.innerHTML = `
      <div class="favoritoItem">
        <div class="carrito-img-container">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>
        <h1>${producto.nombre}</h1>
        <h2>$${producto.precio}</h2>
        <p>${producto.descripcion}</p>
        
        <button class="btnEliminar" onclick="eliminarFavorito(${index})">❌</button>
      </div>
    `
    contenedor.appendChild(div)
  })
}

function eliminarFavorito(index) {
  favoritos.splice(index, 1)
  cantFavorito()
  formularioFavorito()
}

document.addEventListener('DOMContentLoaded', () => {
  const btnVaciarFavorito = document.getElementById('btnVaciarFavorito');
  if (btnVaciarFavorito) btnVaciarFavorito.addEventListener('click', vaciarFavorito);
})

function vaciarFavorito() {
  favoritos.length = 0
  cantFavorito()
  formularioFavorito()
}

// Slider
function renderizarSliderSimple() {
  const slider = document.getElementById('slider-simple')
  if (!slider) return
  const ultimos = bolsas
  slider.innerHTML = `
    <div class="slider-simple-inner">
      ${ultimos.map(bolsas => `
        <div class="slide-simple">
          <div class='img-container'>
            <img src="${bolsas.imagen}" alt="${bolsas.nombre}" />
            <button onclick="agregarMeGusta(${bolsas.codigo})" class="btn-like" aria-label="Me gusta">♥</button>
          </div>
          <h3>${bolsas.nombre}</h3>
          <span class="precio">$${bolsas.precio}</span>
          <p>${bolsas.descripcion}</p>
          <img src="../media/body/header/estrella.png" alt="estrella" class="estrella-slider" />
          <button onclick="agregarCarrito(${bolsas.codigo})" class="btn-carrito">Agregar al carrito</button>
        </div>
      `).join('')}
    </div>
  `
}
document.addEventListener('DOMContentLoaded', renderizarSliderSimple)

window.vaciarCarrito = vaciarCarrito
window.eliminarCarrito = eliminarCarrito
window.agregarCarrito = agregarCarrito
window.verFormulario = verFormulario
window.filtroMarca = filtroMarca
window.filtroColor = filtroColor
window.aplicarFiltros = aplicarFiltros
window.ordenamiento = ordenamiento
window.buscar = buscar
window.toggleSubmenu = toggleSubmenu
window.toggleMenu = toggleMenu
window.limpiarFiltros = limpiarFiltros
window.vaciarFavorito = vaciarFavorito
window.eliminarFavorito = eliminarFavorito
window.agregarMeGusta = agregarMeGusta
window.verFormularioFavorito = verFormularioFavorito