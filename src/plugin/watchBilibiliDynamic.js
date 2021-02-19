import CQ from '../CQcode';
//动态插件

const axios = require("axios");
var qjdynamic_str = new Object();
var watchBilibiliDynamic_config = global.config.bot.watchBilibiliDynamic
for(let element of watchBilibiliDynamic_config['bilibili_watchid']){
    console.log(element)
    qjdynamic_str[element] = ""
}
var restart_status = 0
async function getdynamicInfoData(id){
    return await axios({
        url:"https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid="+id+"&offset_dynamic_id=0&need_top=0",
        method: "GET",
        headers: {"User-Agent": "Mozilla/5.0",
        "Referer": "https://www.bilibili.com/"}
        
    }).catch(e => {
        console.log('获取失败')
        return null;
      });

 
}

async function watchBilibiliDynamic(){
    watchBilibiliDynamic_config = global.config.bot.watchBilibiliDynamic
    for(let element of watchBilibiliDynamic_config['bilibili_watchid']){
    let res = await getdynamicInfoData(element)
    if(res){
            res = res['data']['data']['cards'][0]
            var time = new Date(res['desc']['timestamp']*1000).toLocaleString()
            let dynamic_info = {
                username:res['desc']['user_profile']['info']['uname'],
                dynamic_id:res['desc']['dynamic_id_str'],
                type:res['desc']['type'],
                time:time
            }
            if(restart_status === 0){
                qjdynamic_str[element]=dynamic_info.dynamic_id
                
            }
            if(dynamic_info.dynamic_id!=qjdynamic_str[element]){
                let dynamic_url ="https://t.bilibili.com/"+dynamic_info.dynamic_id
                let ress = JSON.parse(res['card'])
                let message = ''
                qjdynamic_str[element] = dynamic_info.dynamic_id
                if (dynamic_info.type == 1){
                    let zfcontent = ress['item']['content']
                    let TypeOneJson = JSON.parse(ress['origin'])
                    if (TypeOneJson.hasOwnProperty('item') && TypeOneJson['item'].hasOwnProperty('pictures')){
                        let orgincontent = TypeOneJson['item']['description']
                        let pictures_count = TypeOneJson['item']['pictures_count']
                        let pic_list = TypeOneJson['item']['pictures']
                        message = `${dynamic_info.username}转发了一条动态：\n\n传送门→ ${dynamic_url} \n转发内容:${zfcontent}\n原博:${orgincontent}\n`+`\n发布时间:${dynamic_info.time}`
                        for(let i of pic_list){
                            message= message+ CQ.img(i['img_src'])
    
                        } 
                        
                    }else if(TypeOneJson.hasOwnProperty('item') && !TypeOneJson['item'].hasOwnProperty('pictures')){
                        let orgincontent2 = TypeOneJson['item']['content']
                        message = `${dynamic_info.username}转发了一条动态：\n\n传送门→ ${dynamic_url} \n转发内容:${zfcontent}\n原博:${orgincontent2}\n` +`\n发布时间:${dynamic_info.time}`      
                    } 
                    else{
                        let spfm = TypeOneJson['pic']
                        let sptitle = TypeOneJson['title']
                        let orgincontent =  TypeOneJson['dynamic']
                        let orgurl = TypeOneJson['short_link']
                        message = `${dynamic_info.username}转发了一条动态：\n\n传送门→  ${dynamic_url}  \n转发内容:  ${zfcontent}  \n原博:  ${orgincontent}\n原博视频链接：${orgurl}\n原博视频标题：${sptitle}\n原博视频封面`+CQ.img(spfm)+`\n发布时间:${dynamic_info.time}`
                        
                    }
                }else if(dynamic_info.type == 2){
                    let content = ress['item']['description']
                    let pictures_count = ress['item']['pictures_count']
                    let pic_list = ress['item']['pictures']
                    message = `${dynamic_info.username}发布了一条动态：\n\n传送门→  ${dynamic_url}   \n原博:  ${content}\n ` +`\n发布时间:${dynamic_info.time}`
                    for(let i of pic_list){
                        message= message+ CQ.img(i['img_src'])

                    } 

                }else if(dynamic_info.type == 4){
                    content = ress['item']['content']
                    message = `${dynamic_info.username}发布了一条动态：\n\n传送门→  ${dynamic_url}   \n原博:  ${content}\n ` +`\n发布时间:${dynamic_info.time}`
                }else if(dynamic_info.type == 8){
                    let bv_url = 'https://www.bilibili.com/video/' + res['desc']['bvid']
                    let bv_desc =res['card']['dynamic']
                    let spfm = ress['pic']
                    let sptitle = ress['title']
                    message = `${dynamic_info.username}她说：${bv_desc}\n并且发布了新投稿\n\n传送门→ ${bv_url}  \n视频标题:${sptitle}\n视频封面：`+CQ.img(spfm) +`\n发布时间:${dynamic_info.time}`
                }else if(dynamic_info.type == 16){
                    message = `${dynamic_info.username}发布了短视频\n\n传送门→ ${dynamic_url}\n`+`\n发布时间:${dynamic_info.time}`
                }else if(dynamic_info.type ==64){
                    message = `"${dynamic_info.username}发布了新专栏\n\n传送门→  ${dynamic_url}  \n`+`\n发布时间:${dynamic_info.time}`

                }else if(dynamic_info.type == 256 ){
                    message = `${dynamic_info.username}发布了新动态\n\n传送门→ ${dynamic_url}\n`+`\n发布时间:${dynamic_info.time}`

                }else{
                    message = `${dynamic_info.username}发布了新动态\n\n传送门→ ${dynamic_url}\n`+`\n发布时间:${dynamic_info.time}`
                }
                for(let prelement of watchBilibiliDynamic_config['qq_private_userid']){
                    global.sendprivateMsg(message,prelement)
                }
                for(let pbelement of watchBilibiliDynamic_config['qq_public_groupid']){
                    global.sendGroupMsg(message,pbelement)
                }
            }
        
        }
    }
    restart_status=restart_status+1
}


export default watchBilibiliDynamic;