//HALPERS SÃO PEQUENAS FUNÇÕES QUE SERVEM PARA AJUDAR EM ALGUMA COISA (é como se fosse um pequeno midleware)

//ESTA ARQUIVO VERIFICA SE UM USUARIO ESTA AUTENTICADO E SE ELE É ADMIN

module.exports = {
    eAdmin: function(req, res, next){
        //isAuthenticated() = é gerada pelo passport e serve para identificar se um usuário esta autenticado ou não
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next();
        }

        req.flash("error_msg", "Você não tem permissão de Admin")
        res.redirect("/")
    }
}
