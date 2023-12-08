
const authenticateKey = (req, res, next) => {
    let api_key = req.header("x-api-key"); //Add API key to headers
    if(api_key == process.env.APIKEY){
        next()
    }else{
        res.status(403).send("access denied")
    }
}

module.exports = authenticateKey