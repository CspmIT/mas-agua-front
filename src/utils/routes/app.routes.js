export const front = {
    Cooptech:
        import.meta.env.VITE_ENTORNO == 'local'
            ? 'https://dev.cooptech.com.ar'
            : import.meta.env.VITE_ENTORNO == 'desarrollo'
            ? 'https://dev.cooptech.com.ar'
            : 'https://cooptech.com.ar',
    'Oficina Virtual': 'https://oficinainterna.cooptech.com.ar',
    Reconecta:
        import.meta.env.VITE_ENTORNO == 'local'
            ? 'http://localhost:8000'
            : import.meta.env.VITE_ENTORNO == 'desarrollo'
            ? 'https://devreconecta.cooptech.com.ar/'
            : 'https://reconecta.cooptech.com.ar',
    'Mas Agua':
        import.meta.env.VITE_ENTORNO == 'local'
            ? 'http://localhost:1420'
            : 'https://masagua.cooptech.com.ar',
    Centinela: 'http://localhost:8082',
    Cloud: 'http://localhost:8082',
    Provision: 'http://localhost:8082',
}

export const backend = {
    Cooptech: `${front.Cooptech}/api`,
    'Oficina Virtual': `${front['Oficina Virtual']}/api`,
    Reconecta: `${front.Reconecta}/api`,
    'Mas Agua':
        import.meta.env.VITE_ENTORNO == 'local'
            ? 'http://localhost:4000/api'
            : 'https://masagua.cooptech.com.ar/api',
    Centinela: `${front.Centinela}/api`,
    Cloud: `${front.Cloud}/api`,
    Provision: `${front.Provision}/api`,
    Archivos:
        import.meta.env.VITE_ENTORNO == 'local'
            ? 'http://localhost:5000/minio'
            : 'https://storageov.cooptech.com.ar/minio',
}
