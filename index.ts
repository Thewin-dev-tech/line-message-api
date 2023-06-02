const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const cryp = require("crypto");

const app = express();

app.use(bodyParser.json());

require("dotenv").config();

app.get("/", (req : any , res : any) => {
    try{
        res.send("Hello World!");
    }catch(error:any){
        res.send("Hello World!");
    }
});

app.post("/line-webhook",async function _(request:any , response : any) : Promise<any>{
    try{
        const body = JSON.stringify(request.body);
        const channelSecret = process.env.CHANNEL_ACCESS_TOKEN; // Channel secret string
        console.dir(body, { depth: null });
        console.log(`-----------------------`);

        //---------- ไว้ verify ว่าเป็นของจริงไหม ---------------------
        const signature = cryp.createHmac("SHA256", channelSecret).update(body).digest("base64");
        console.log(signature);
        //-------------------------------------------------------


        //---------  ส่งไป Message คืน -----------------------
        let jsonBody = JSON.parse(body);
        let mgsFromSmartBot = [
                            {
                                "type":"text",
                                "text":"ขอบคุณที่ส่งมานะครับ"
                            }
                            
        ];
        
        if(String(jsonBody.events[0].message.text )=== "ขอทราบชื่อนายก"){
            mgsFromSmartBot.push( {
                "type":"text",
                "text":"ประยุส"
            })
        }
        if(String(jsonBody.events[0].message.text )=== "สมัครรับข้อมูล"){
            mgsFromSmartBot.push( {
                "type":"text",
                "text":`Your id is->`+jsonBody.events[0].source.userId
            })
            
        }

        const config = {
            method : "POST",
            url : "https://api.line.me/v2/bot/message/reply",
            headers: { 
                "Content-Type": "application/json",
                "Authorization" : "Bearer "+channelSecret
            },
            data : JSON.stringify({
                "replyToken": jsonBody.events[0].replyToken,
                "messages": mgsFromSmartBot
            })
        };
        const sentMessageResponse = await axios(config);
        console.log(`send message response`,sentMessageResponse.data);
        //--------------------------------------------------

        response.status(200).send("this is line webhook!");
    }catch(error : any){
        console.log(`issue ->`,error.response.data || error.stack);
        response.status(500).send("error");
    }
});

app.get("/line-send-push",async function _(request:any , response : any) : Promise<any>{
    try{

        const body = JSON.stringify(request.body);
        const channelSecret = process.env.CHANNEL_ACCESS_TOKEN; // Channel secret string

        //---------  ส่งไป Message คืน -----------------------
        let jsonBody = JSON.parse(body);
        let mgsFromSmartBot = [
                            {
                                "type":"text",
                                "text":"นี่คือแจ้งเตือน"
                            }
        ];

        const config = {
            method : "POST",
            url : "https://api.line.me/v2/bot/message/push",
            headers: { 
                "Content-Type": "application/json",
                "Authorization" : "Bearer "+channelSecret
            },
            data : JSON.stringify({
                "to": "Ub08b524924c0e9f70bec86c9918a4eeb",
                "messages": mgsFromSmartBot
            })
        };
        const sentMessageResponse = await axios(config);
        console.log(`send message to user`,sentMessageResponse.data);
        //--------------------------------------------------

        response.status(200).send("this is line push!");
    }catch(error : any){
        console.log(`issue ->`,error.response.data || error.stack);
        response.status(500).send("error");
    }
});
      

const port:number = 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));