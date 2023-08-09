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
        if(! jsonBody.events[0]?.message) return response.status(200).json({message:"verify webhook"});
        let mgsFromSmartBot = [
                            {
                                "type":"text",
                                "text":"ขอบคุณที่ส่งมานะครับ"
                            }
                            
        ];
        console.log(jsonBody.events[0].message.text)
        
        if(String(jsonBody.events[0].message.text )=== "ขอทราบชื่อนายก"){
            mgsFromSmartBot.push( {
                "type":"text",
                "text":"ประยุส"
            })
        }
        if(String(jsonBody.events[0].message.text )=== "สมัครรับข้อมูล"){
            // mgsFromSmartBot.push( {
            //     "type":"text",
            //     "text":`Your id is->`+jsonBody.events[0].source.userId
            // })
            console.log("test--------------------------------")
            const userId:string = String(jsonBody.events[0].source.userId);
            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `https://api.line.me/v2/bot/user/${userId}/linkToken`,
                headers: { 
                    "Authorization" : "Bearer "+channelSecret
                }
              };
            let issueData = (await axios(config)).data; 
            
            //---- ตรงนี้บันทึก userId และ issueData ไว้เลย ---------
            console.log(`iss_za->`,issueData.linkToken);

            let mgsFromSmartBot = [
                {
                    "type":"text",
                    "text":"นี่คือแจ้งเตือน"
                }
];

            const configForPush = {
            method : "POST",
            url : "https://api.line.me/v2/bot/message/push",
            headers: { 
                "Content-Type": "application/json",
                "Authorization" : "Bearer "+channelSecret
            },
            data : JSON.stringify({
                "to": `${userId}`,
                "messages": [{
                    "type": "template",
                    "altText": "Account Link",
                    "template": {
                        "type": "buttons",
                        "text": "Account Link",
                        "actions": [{
                            "type": "uri",
                            "label": "Account Link",
                            "uri": `http://example.com/link?linkToken=${issueData.linkToken}`
                        }]
                    }
                }]
            })
            };
            const sentMessageResponse = await axios(configForPush);
            console.log(`send login page to -->`,sentMessageResponse.data);
            //--------------------------------------------------

            
        }
        if(String(jsonBody.events[0].message.text )=== "ติดต่อด่วน"){
            mgsFromSmartBot.push( {
                "type":"text",
                "text":`หากรีบโปรดโทรไปที่ 095-555-5555`
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
        console.log(`issue ->`,error.response?.data || error.stack);
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
                                "text":"ขี้เยสๆ"
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
                "to": "Ue4ea2f5284a54283929b40fb178d6566",
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
      
app.post("/rtu-webhook",require("./rtus-api"));

const port:number = 3001;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));