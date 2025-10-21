const urlBase = '/assets/img/Diagram/newDiagram'
const urlBaseView = '/assets/img/Diagram/diagramAction'

export const ListImg = () => [
    {
        id: 1,
        name: 'Cisterna enterrada',
        src: `${urlBase}/Cisterna.png`,
        srcView: `${urlBaseView}/cisternaTerminada.png`,
        animation: 'wave',
        configAnimation: {
            color: '#38bdf8',
            margenLeft: 0.023,
            margenTop: 0,
            margenTopMin: 0.15,
            margenTopMax: 0.9,
            margenBotonLeft: 0.8,
            widthTop: 96,
            widthBottom: 92,
            heightLeft: 74,
            heightRight: 74,
        },
        variables: {
            nivel: { id_variable: 0, show: false, require: true },
            egreso: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 2,
        name: 'Cisterna horizontal',
        src: `${urlBase}/tanque_horizontal.png`,
        srcView: `${urlBaseView}/tanque_horizontal.png`,
        animation: 'wave',
        configAnimation: {
            color: '#38bdf8',
            margenLeft: 0.1,
            margenTop: 0,
            margenTopMin: 0.15,
            margenTopMax: 0.9,
            margenBotonLeft: 1,
            widthTop: 76,
            widthBottom: 75,
            heightLeft: 53,
            heightRight: 53,
            offsetBottom: 0.07,
        },
        variables: { nivel: { id_variable: 0, show: false, require: false } },
    },
    {
        id: 3,
        name: 'Cisterna Vertical Simple',
        src: `${urlBase}/Tanques_agua_simple.png`,
        srcView: `${urlBaseView}/Tanques_agua_simple.png`,
        animation: 'wave',
        configAnimation: {
            color: '#38bdf8',
            margenLeft: 0.3,
            margenTop: 0,
            margenTopMin: 0.15,
            margenTopMax: 0.9,
            margenBotonLeft: 0,
            widthTop: 43,
            widthBottom: 43,
            heightLeft: 66,
            heightRight: 66,
        },
        variables: { nivel: { id_variable: 0, show: false, require: false } },
    },
    {
        id: 4,
        name: 'Cisterna Vertical Multiple',
        src: `${urlBase}/Tanques_agua_multiple.png`,
        srcView: `${urlBaseView}/Tanques_agua_multiple.png`,
        animation: 'wave',
        configAnimation: {
            color: '#38bdf8',
            margenLeft: 0.48,
            margenTop: 0,
            margenTopMin: 0.15,
            margenTopMax: 0.9,
            margenBotonLeft: 0,
            widthTop: 23,
            widthBottom: 23,
            heightLeft: 68,
            heightRight: 68,
        },
        variables: { nivel: { id_variable: 0, show: false, require: false } },
    },
    {
        id: 5,
        name: 'Tanque elevado',
        src: `${urlBase}/tanque_elevado2.png`,
        srcView: `${urlBase}/tanque_elevado2.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 6,
        name: 'Caudalímetro',
        src: `${urlBase}/Caudalimetro.png`,
        srcView: `${urlBase}/Caudalimetro.png`,
        variables: { caudal: { id_variable: 0, show: false, require: false } },
    },
    {
        id: 7,
        name: 'Dosificador',
        src: `${urlBase}/Dosificador_quimicos.png`,
        srcView: `${urlBase}/Dosificador_quimicos.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 8,
        name: 'Barómetro',
        src: `${urlBase}/Barometro.png`,
        srcView: `${urlBase}/Barometro.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 9,
        name: 'Presostato',
        src: `${urlBase}/Presostato_rojo.png`,
        srcView: `${urlBaseView}/Presostato_rojo.png`,
        animation: 'boolean',
        optionsImage: {
            error: `${urlBaseView}/Presostato_rojo.png`,
            success: `${urlBaseView}/Presostato_verde.png`,
            default: `${urlBaseView}/Presostato_rojo.png`,
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 10,
        name: 'Bidón',
        src: `${urlBase}/Estanque_cloro.png`,
        srcView: `${urlBaseView}/Estanque_cloro3.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
        animation: 'wave',
        configAnimation: {
            color: '#fde047',
            margenLeft: 0.2,
            margenBotonLeft: 0,
            margenTop: 0,
            margenTopMin: 0.15,
            margenTopMax: 0.9,
            widthTop: 65,
            widthBottom: 64,
            heightLeft: 56,
            heightRight: 56,
            offsetBottom: 0.08,
        },
    },
    {
        id: 11,
        name: 'Llave de paso',
        src: `${urlBase}/Valvula.png`,
        srcView: `${urlBase}/Valvula_OFF.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Valvula__BAD.png',
            success:
                '/assets/img/Diagram/diagramAction/Valvula__OK.png',
            default:
                '/assets/img/Diagram/diagramAction/Valvula_OFF.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 12,
        name: 'Bomba presurizadora',
        src: `${urlBase}/Bomba_presurizadora.png`,
        srcView: `${urlBaseView}/Bomba presurizadora (gris).png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Bomba presurizadora (roja).png',
            success:
                '/assets/img/Diagram/diagramAction/Bomba presurizadora (verde).png',
            default:
                '/assets/img/Diagram/diagramAction/Bomba presurizadora (gris).png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 13,
        name: 'Bomba sumergible',
        src: `${urlBase}/Bomba_sumergible.png`,
        srcView: `${urlBaseView}/Bomba sumergible gris.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Bomba sumergible roja.png',
            success:
                '/assets/img/Diagram/diagramAction/Bomba sumergible verde.png',
            default:
                '/assets/img/Diagram/diagramAction/Bomba sumergible gris.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 14,
        name: 'Ósmosis',
        src: `${urlBase}/ósmosis.png`,
        srcView: `${urlBaseView}/ósmosis.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 15,
        name: 'Filtro multimedia',
        src: `${urlBase}/Filtro_Multimedia.png`,
        srcView: `${urlBaseView}/Filtro Multimedia.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 16,
        name: 'Filtro cartucho',
        src: `${urlBase}/Filtro_cartucho.png`,
        srcView: `${urlBaseView}/Filtro cartucho.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 17,
        name: 'Filtro de manga',
        src: `${urlBase}/Tubos_osmosis.png`,
        srcView: `${urlBaseView}/Tubos_osmosis.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 18,
        name: 'Instrumento',
        src: `${urlBase}/Sonda_conductimetro.png`,
        srcView: `${urlBaseView}/Sonda_conductimetro.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },

    },
    {
        id: 19,
        name: 'Indicador Luminoso',
        src: `${urlBase}/Sonda_conductimetro.png`,
        srcView: `${urlBaseView}/Sonda_conductimetro.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 20,
        name: 'Bomba Centrífuga',
        src: `${urlBase}/bomba_centrifuga_off.png`,
        srcView: `${urlBase}/bomba_centrifuga_off.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/bomba_centrifuga_off.png',
            success:
                '/assets/img/Diagram/diagramAction/bomba_centrifuga_on.png',
            default:
                '/assets/img/Diagram/diagramAction/bomba_centrifuga_off.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 21,
        name: 'Led',
        src: `${urlBase}/led_OFF.png`,
        srcView: `${urlBase}/led_OFF.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/led_OFF.png',
            success:
                '/assets/img/Diagram/diagramAction/led_FAIL.png',
            default:
                '/assets/img/Diagram/diagramAction/led_OFF.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 22,
        name: 'Relé Térmico',
        src: `${urlBase}/Relé térmico_OFF.png`,
        srcView: `${urlBase}/Relé Térmico_OFF.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Relé térmico_OK.png',
            success:
                '/assets/img/Diagram/diagramAction/Relé térmico_FAIL.png',
            default:
                '/assets/img/Diagram/diagramAction/Relé térmico_OFF.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 23,
        name: 'Arranque',
        src: `${urlBase}/Arranque triangulo.png`,
        srcView: `${urlBase}/Arranque triangulo.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Arranque estrella.png',
            success:
                '/assets/img/Diagram/diagramAction/Arranque triangulo.png',
            default:
                '/assets/img/Diagram/diagramAction/Arranque triangulo.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 24,
        name: 'Tanque Elevado',
        src: `${urlBaseView}/Tanque_elevado.png`,
        srcView: `${urlBaseView}/Tanque_elevado.png`,
        animation: 'wave',
        configAnimation: {
            color: '#38bdf8',
            margenLeft: 0.278,
            margenTop: 0,
            margenTopMin: 0.13,
            margenTopMax: 0.33,
            margenBotonLeft: 0.8,
            widthTop: 47,
            widthBottom: 45,
            heightLeft: 64,
            heightRight: 64,
        },
        variables: {
            nivel: { id_variable: 0, show: false, require: true },
            egreso: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 25,
        name: 'Bomba Sumergible 2',
        src: `${urlBase}/bomba_sumergible_default.png`,
        srcView: `${urlBase}/bomba_sumergible_default.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/bomba_sumergible_default.png',
            success:
                '/assets/img/Diagram/diagramAction/bomba_sumergible_OK.png',
            default:
                '/assets/img/Diagram/diagramAction/bomba_sumergible_default.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 26,
        name: 'Grupo Generador',
        src: `${urlBase}/grupo_generador_default.png`,
        srcView: `${urlBase}/grupo_generador_default.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/grupo_generador_OFF.png',
            success:
                '/assets/img/Diagram/diagramAction/grupo_generador_ON.png',
            default:
                '/assets/img/Diagram/diagramAction/grupo_generador_default.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 27,
        name: 'Grupo Generador (no cabinado)',
        src: `${urlBase}/Grupo generador (no cabinado) OFF.png`,
        srcView: `${urlBase}/Grupo generador (no cabinado) OFF.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Grupo generador (no cabinado) OFF.png',
            success:
                '/assets/img/Diagram/diagramAction/Grupo generador (no cabinado) ON.png',
            default:
                '/assets/img/Diagram/diagramAction/Grupo generador (no cabinado) OFF.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 28,
        name: 'Contactor',
        src: `${urlBase}/Contactor_OFF.png`,
        srcView: `${urlBase}/Contactor_OFF.png`,
        animation: 'boolean',
        optionsImage: {
            error: '/assets/img/Diagram/diagramAction/Contactor_OFF.png',
            success:
                '/assets/img/Diagram/diagramAction/Contactor_ON.png',
            default:
                '/assets/img/Diagram/diagramAction/Contactor_OFF.png',
        },
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 29,
        name: 'Maquina osmosis pequeña',
        src: `${urlBase}/Máquina_osmosis_pequeña.png`,
        srcView: `${urlBaseView}/Máquina_osmosis_pequeña.png`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    {
        id: 30,
        name: 'Img sin fondo',
        src: `${urlBase}/img_sinfondo.PNG`,
        srcView: `${urlBaseView}/img_sinfondo.PNG`,
        variables: {
            variable1: { id_variable: 0, show: false, require: false },
        },
    },
    
]
