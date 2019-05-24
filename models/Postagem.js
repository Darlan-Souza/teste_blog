const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true 
    },
    slug:{
        type: String,
        required: true 
    },
    descricao:{
        type: String,
        required: true 
    },
    conteudo:{
        type: String,
        required: true 
    },
    /*NESTA PARTE CRIO O RELACIONAMENTO ENTRE UMA POSTAGEM E UMA CATEGORIA
    Esse cara vai armazenar o id de uma categoria*/
    categoria:{
        //Schema.Types.ObjectId, isso quer dizer que a categoria vai armazenar o id de algum objeto
        type: Schema.Types.ObjectId,
        //quando eu crio um objeto dessa maneira preciso passar uma referencia e neste casso a referencia vai ser pro tipo de objeto 'categorias'
        ref: 'categorias',
        required: true
    },
    data: {
        type: Date,
        //passo um valor padrão para o campo
        default: Date.now()
    }
})

mongoose.model('postagens', Postagem)