module.exports = (request:any,response:any,next:any)=>{
    try{
        console.log(`#-----------------------------#`);
        console.log(request.body);
        response.status(200).json({message : "ok",status : true});
    }catch(error : any ){ 
        console.error("error rtus webhook endpoint->",error.stack);
        response.status(401).json({message : "error",status : false});
    }
}