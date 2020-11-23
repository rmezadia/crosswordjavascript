
//Contiene informacion de las palabras.
const palabras = [
/* palabra 1*/
    {
    posicion: [8, 2],
    orientacion: 1,
    palabra: 'javascript',
    descripcion: 'Tema 1.4'
    },
    {
    /* palabra 2*/
    posicion: [1, 10],
    orientacion: 0,
    palabra: 'html',
    descripcion: 'Tema 1.2'
    },
    {
    /* palabra 3*/
    posicion: [14, 7],
    orientacion: 1,
    palabra: 'css',
    descripcion: 'Tema 1.3'
    },
    /* palabra 4*/
    {
    posicion: [0, 0],
    orientacion: 1,
    palabra: 'cascada',
    descripcion: 'Tema 1.3'
    },
    /* palabra 5*/
    {
    posicion: [10, 2],
    orientacion: 1,
    palabra: 'dom',
    descripcion: 'Tema 1.4'
    },
    /* palabra 6*/
    {
    posicion: [0, 8],
    orientacion: 0,
    palabra: 'event',
    descripcion: 'Tema 1.4'
    },
  
    {
    /* palabra 7*/
    posicion: [6, 8],
    orientacion: 0,
    palabra: 'atributos',
    descripcion: 'Tema 1.4'
    },
    /* palabra 8*/
    {
    posicion: [1, 3],
    orientacion: 0,
    palabra: 'encabezados',
    descripcion: 'Tema 1.2'
    },
    /* palabra 9*/
    {
    posicion: [4, 0],
    orientacion: 1,
    palabra: 'enlaceshtml',
    descripcion: 'Tema 1.2'
    },
      /* palabra 10*/
    {
    posicion: [3,0],
    orientacion: 0,
    palabra: 'metodos',
    descripcion: 'Tema 1.4'
    }
]

//Informacion sobre las celdas vacias.
const celdasVacias = {
  comienzo: false,
  letra: '',
  arrayPalabras: [],
  celdasVacias: true
}
//Instancia Vue para crear la aplicacion Vue
new Vue({
  el: '#app',
  data () {
    return {
      //Array para ver si la palabra se ha rellenado o no.
      completed: Array(palabras.length).fill(false),
      //Indica la pabra seleccionada.
      palabraSelec: undefined,
      //Lugar donde se guarda la respuesta del usuario.
      respuesta: '',
      //Veces que el usuario hizo click en el boton "descripción".
      penalizacion: 0,
      //Tiempo restate del juego.
      temporizador: 60 * 10,
      //Tablero del crucigrama.
      matriz: [],
      //Popu que muestra al finalizar el juego.
      mensaje: undefined
    }
  },
  //Crea la tabla del crucigrama.
  created () {
    
    const width = palabras.reduce((max, cur) => 
                                  Math.max(max, cur.posicion[0] + (cur.orientacion === 0 ? cur.palabra.length : 1)), 0)
    const height = palabras.reduce((max, cur) => 
                                  Math.max(max, cur.posicion[1] + (cur.orientacion === 1 ? cur.palabra.length : 1)), 0)
    let matriz = Array(height).fill(0).map(() => Array(width).fill(null).map(() => celdasVacias))
    palabras.forEach((palabra, index) => {
      const [x, y] = palabra.posicion
      palabra.palabra.split('').forEach((l, i) => {
        let celda = matriz[y + (palabra.orientacion ? i : 0)][x + (palabra.orientacion ? 0 : i)]
        if (celda === celdasVacias) {
          celda = matriz[y + (palabra.orientacion ? i : 0)][x + (palabra.orientacion ? 0 : i)] = {arrayPalabras: []}
        }
        celda.celdasVacias = false
        celda.arrayPalabras.push(index)
        if (i === 0) {
          celda.comienzo = index + 1
        }
        celda.letra = l
      })
    })
    this.matriz = matriz
    
    //Controla el tiempo restante del juego.
    this.$options.interval = setInterval(() => {
      this.temporizador--
      if (this.temporizador <= 0) {
        clearInterval(this.$options.interval)
        this.finalizar()
      }
    }, 1000)
  },
  computed: {
    //Descripcion de la palabra seleccionada.
    descripcion () {
      if (this.palabraSelec === undefined) return undefined
      return `${palabras[this.palabraSelec].orientacion ? 'Vertical' : 'Horizontal'} ${this.palabraSelec + 1}: ${palabras[this.palabraSelec].descripcion}`
    },
    //Devuelve el tiempo del juego.
    tiempo () {
      const minutos = Math.floor(this.temporizador/60).toString().padStart(2, '0')
      const segundos = Math.floor(this.temporizador%60).toString().padStart(2, '0')
      return `${minutos}:${segundos}`
    }
  },
  methods: {
    //Selecciona la palabra en el crucigrama.
    seleccionaPalabra (index) {
      if (index > 0) {
        this.palabraSelec = index - 1
        this.respuesta = ''
        setTimeout(() => this.$refs.input.focus(), 50)
      }
    },
    //Verifica si la palabra es correcta y la añade al array de palabras correctas.
    corrigePalabra () {
      const solucionPalabra = palabras[this.palabraSelec].palabra
      const palabraIngresada = this.respuesta.toLowerCase()
      if (palabraIngresada === solucionPalabra) {
        this.completed[this.palabraSelec] = true
        this.palabraSelec = undefined
      }
    },
    //Añade letra a la palabra que se está ingresando.
    aniadeLetraCorrecta () {
      const solucionPalabra = palabras[this.palabraSelec].palabra
      const palabraIngresada = this.palabraIngresada.toLowerCase()
      if (palabraIngresada === solucion) {
        return
      }
      if (palabraIngresada !== solucion.slice(0, palabraIngresada.length)) {
        this.penalizacion++
        this.palabraIngresada = ''
      }
      this.palabraIngresada = solucion.slice(0, this.palabraIngresada.length + 1)
      this.penalizacion++
    },
    //Calcula el puntaje final del jugador teniendo en cuenta las penalizaciones.
    calcularPuntaje () {
      const total = this.completed.reduce((total, current, i) => total + palabras[i].palabra.length, 0)
      const completo = this.completed.reduce((total, current, i) => current ? total + palabras[i].palabra.length : total, 0)
      const puntajeTiempo = Math.ceil(100 * completo / total)
      const puntajeFinal = Math.max(puntajeTiempo - this.penalizacion, 0)
      if (puntajeTiempo < 100) {
        this.penalizacion++
      }
      this.mensaje = `
        Tu puntuación es ${puntajeFinal}%.
      `
    }
  }
})