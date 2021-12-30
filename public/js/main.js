window.addEventListener('load', () => {
    
    const appendResult = (data) => {
        const result = document.getElementById('result')
        const a = document.createElement('a')
        const text = document.createTextNode(data)

        a.appendChild(text)
        a.title = `${data}`
        a.href = `/consulta-envio?trackingcode=${data}`
        result.appendChild(a)
    }
    
    if (window.location.pathname === '/envio') {
        document.getElementById('formWaterFile').addEventListener('submit', (e) => {
            e.preventDefault()
            
            const fileInput = document.getElementById('inputWaterFile')
            const formData = new FormData()
    
            formData.append('file', fileInput.files[0])
    
            axios.post('http://lis.leega.com.br/Emissor/3/TipoDocumento/3/Upload/1', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(
                response => {
                    appendResult(response.data[0])
                }
            )
    
        })
        document.getElementById('formEletroFile').addEventListener('submit', (e) => {
            e.preventDefault()
            
            const fileInput = document.getElementById('inputEletroFile')
            const formData = new FormData()
    
            formData.append('file', fileInput.files[0])
    
            axios.post('http://lis.leega.com.br/Emissor/2/TipoDocumento/2/Upload/1', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(
                response => {
                    appendResult(response.data[0])
                }
            )
    
        })
        document.getElementById('formServiceFile').addEventListener('submit', (e) => {
            e.preventDefault()
            
            const fileInput = document.getElementById('inputServiceFile')
            const formData = new FormData()
    
            formData.append('file', fileInput.files[0])
    
            axios.post('http://lis.leega.com.br/Emissor/1/TipoDocumento/5/Upload/1', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }).then(
                response => {
                    appendResult(response.data[0])
                }
            )
    
        })
    }

    
})