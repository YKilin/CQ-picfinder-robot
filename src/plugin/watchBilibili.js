import CQ from '../CQcode';
//直播间监视插件
const axios = require("axios");
const sleep = (timeountMS) => new Promise((resolve) => {
    setTimeout(resolve, timeountMS);
  });
var WatchLiveStatus = new Object();
var watchBilibili_config = global.config.bot.watchBilibili
for(let element of watchBilibili_config['bilibili_watchid']){
    WatchLiveStatus[element] = 0
}

async function getRoomInfoData(id){
    return await axios({
        url:"https://api.live.bilibili.com/room/v1/Room/getRoomInfoOld?mid="+id,
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0",
        "Referer": "https://www.bilibili.com/"}
        
    }).catch(e => {
        console.log('获取失败')
        return null;
      });

 
}

async function watchBilibili(){
    watchBilibili_config = global.config.bot.watchBilibili
    for(let element of watchBilibili_config['bilibili_watchid']){
        
    let res = await getRoomInfoData(element)
        if(res){
            res = res['data']['data']
            if(res['roomStatus']===0){
                console.log('不存在')
            }else{
                if(res['liveStatus']!=WatchLiveStatus[element]){
                    
                    if(res['liveStatus'] === 1){

                        for(let prelement of watchBilibili_config['qq_private_userid']){
                            await sleep(500)
                            global.sendprivateMsg(`直播间地址：${res['url']}\n直播间标题：${res['title']}\n直播间封面：${CQ.img(res['cover'])}`,prelement)
                        }
                        await sleep(2000)
                        for(let pbelement of watchBilibili_config['qq_public_groupid']){
                            await sleep(500)
                            global.sendGroupMsg(`直播间地址：${res['url']}\n直播间标题：${res['title']}\n直播间封面：${CQ.img(res['cover'])}`,pbelement)
                        }
                        WatchLiveStatus[element] = res['liveStatus']
                    }else{
                        WatchLiveStatus[element] = res['liveStatus']
                    }
                }
            }
        }
    }

}


export default watchBilibili;