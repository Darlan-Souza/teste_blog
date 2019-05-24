//Quando estiver todando a aplicção heroku uso a conexão mongodb+srv://darlan123:<password>@cluster0-zcrk3.mongodb.net/test?retryWrites=true

//process.env.NODE_ENV == "production" = serve para falar que minha aplicação esta rodando em ambiente de produção
if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://darlan123:darlan123@cluster0-zcrk3.mongodb.net/test?retryWrites=true"}
}else{
    module.exports= {mongoURI: "mongodb://localhost/blogapp"}
}

//Quando estiver rodando no meu computador uso 