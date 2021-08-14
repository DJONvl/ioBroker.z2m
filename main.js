'use strict';

/*
 * Created with @iobroker/create-adapter v1.26.3
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
// const fs = require("fs");
const WebSocket = require('../ws');


/**
 * The adapter instance
 * @type {ioBroker.Adapter}
 */
let adapter;
var z2m_command;
/**
 * Starts the adapter instance
 * @param {Partial<utils.AdapterOptions>} [options]
 */
function startAdapter(options) {
    // Create the adapter and define its methods
    return adapter = utils.adapter(Object.assign({}, options, {
        name: 'z2m',

        // The ready callback is called when databases are connected and adapter received configuration.
        // start here!
        ready: main, // Main method defined below for readability

        // is called when adapter shuts down - callback has to be called under any circumstances!
        unload: (callback) => {
            try {
                // Here you must clear all timeouts or intervals that may still be active
                // clearTimeout(timeout1);
                // clearTimeout(timeout2);
                // ...
                // clearInterval(interval1);

                callback();
            } catch (e) {
                callback();
            }
        },

        // If you need to react to object changes, uncomment the following method.
        // You also need to subscribe to the objects with `adapter.subscribeObjects`, similar to `adapter.subscribeStates`.
        // objectChange: (id, obj) => {
        //     if (obj) {
        //         // The object was changed
        //         adapter.log.debug(`object ${id} changed: ${JSON.stringify(obj)}`);
        //     } else {
        //         // The object was deleted
        //         adapter.log.debug(`object ${id} deleted`);
        //     }
        // },

        // is called if a subscribed state changes
        stateChange: (id, state) => {
            if (state) {
                // The state was changed
				//adapter.log.info(JSON.stringify(state));                
				if(state.from !='system.adapter.'+adapter.name+'.'+adapter.instance){
				
				adapter.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
				adapter.log.info(JSON.stringify(state));
				var aid=id.split('.')
				try{
//state z2m.0.grp.test.on_off changed: on (ack = false)					
				switch (aid[2])
				{
					case "dev":
					z2m_command(aid[3],aid[4],state.val+"")						
					break;					
					case "grp":
					z2m_command(aid[3],aid[4],state.val+"")						
					break;				
				
				}	
					

				}catch{}
				}				
            } else {
                // The state was deleted
                adapter.log.debug(`state ${id} deleted`);
            }
        },

        // If you need to accept messages in your adapter, uncomment the following block.
        // /**
        //  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
        //  * Using this method requires "common.message" property to be set to true in io-package.json
        //  */
        // message: (obj) => {
        //     if (typeof obj === 'object' && obj.message) {
        //         if (obj.command === 'send') {
        //             // e.g. send email or pushover or whatever
        //             adapter.log.debug('send command');

        //             // Send response in callback if required
        //             if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        //         }
        //     }
        // },
    }));
}

async function main() {
var z2m
var z2m_buf_Devices=[];
adapter.setStateAsync('info.connection', false, true)
    // The adapters config (in the instance object everything under the attribute "native") is accessible via
    // adapter.config:
    adapter.log.debug('config option1: ' + adapter.config.option1);
    adapter.log.debug('config option2: ' + adapter.config.option2);
		var adress='ws://'+adapter.config.option1+":"+adapter.config.option2+"/api"
		adapter.log.debug('z2m adress: ' + adress);
				 function z2mWebSocket() {
					 try{
					  z2m = new WebSocket(adress);
					  z2m.on('open', 	function open() {z2m.send('hello');});
					  z2m.on('message', function incoming(data) {z2m_parse(data);});
					  z2m.on('error', function error(data) {adapter.log.debug(data)}); 
					  }catch(err){adapter.log.debug(err)}
				   }
				   function onOpen(evt) {z2m.send('hello');}
				   function z2m_send(message) {z2m.send(message);}
				   var checkWSz2m = setInterval(function(){
					 //  z2m.clients.forEach(function each(client) {if (client == z2m && client.readyState != WebSocket.OPEN) {z2mWebSocket();}});	
					   adapter.log.debug("*************************checkWSz2m*******************************")			  
					  if(z2m.readyState!=1){adapter.setStateAsync('info.connection', false, true);z2mWebSocket();}else{ adapter.setStateAsync('info.connection', true, true);}
					   
					   }, 5000);

		z2mWebSocket();

		async function z2m_parse(data){	
		//adapter.log.debug(data)
			var data=JSON.parse(data)
				switch (data.topic)
				{
					case "bridge/config":
						break;

					case "bridge/info":

						break;

					case "bridge/state":

					   break;

					case "bridge/devices":
						{
							z2m_buf_Devices=data;
							mk_tree_Device(z2m_buf_Devices);
						}
						break;

					case "bridge/groups":
					adapter.log.info(JSON.stringify(data))
for(var i =0;i < (data.payload).length;i++){	
await adapter.createStateAsync('grp',data.payload[i].friendly_name,"state",{name:"state",type: 'string' ,role:'state',read:true,write: true,native: {},}) 
await adapter.createStateAsync('grp',data.payload[i].friendly_name,"brightness", {name:"brightness",type: 'number' ,role:'state',read:true,write: true,native: {},}) 
await adapter.createStateAsync('grp',data.payload[i].friendly_name,"color_temp", {name:"color_temp",type: 'number' ,role:'state',read:true,write: true,native: {},}) 
				
}						
						
						break;

					case "bridge/event":
						break;

					case "bridge/extensions":

						break;

					case "bridge/logging":

						break;

					case "bridge/response/networkmap":

					   break;


					case "bridge/response/touchlink/scan":

						break;

					case "bridge/response/touchlink/identify":

						break;

					case "bridge/response/touchlink/factory_reset":

						break;


					default:
					var dv=data.topic.split("/")		
					if( dv.length <2 ){
					
					adapter.log.debug("z2m|"+dv[0]+" : "+JSON.stringify(data.payload))
		//			z2m|rozetka : {"current":0.18,"linkquality":220,"power":18,"state":null,"voltage":229.8}
					
					
							  for (let [key, value] of Object.entries(data.payload)) {	
								try{	
									if (value!=null){await adapter.setState('dev.'+dv[0]+'.'+key, value, true)}	
								}catch(e){adapter.log.debug(e)}
							  }			
						
					}
						break;
				}
		}
    // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
    adapter.subscribeStates('dev.*');
    adapter.subscribeStates('grp.*');
    // examples for the checkPassword/checkGroup functions
    adapter.checkPassword('admin', 'iobroker', (res) => {
        adapter.log.debug('check user admin pw iobroker: ' + res);
    });

    adapter.checkGroup('admin', 'admin', (res) => {
        adapter.log.debug('check group user admin group admin: ' + res);
    });


async function mk_tree_Device(data){
adapter.log.debug(JSON.stringify(data));
var devarr=[];
devarr=await z2m_zesp_Device(devarr,data)
adapter.log.debug(JSON.stringify(devarr));
}

async function z2m_zesp_Device(devar,data){
					var z2m_Devices=[];
					for(var i =1;i < (data.payload).length;i++){
							adapter.log.info("------------data.payload["+i+"]----------")
							adapter.log.info(JSON.stringify(data.payload[i]))				 			
							var rep={};
							if(data.payload[i].definition !=null ){
							var exp=data.payload[i].definition.exposes;

							rep=await getFeatures(rep,exp)								
							
							async function getFeatures(arep,aexp){	
									for(var z =0;z < aexp.length;z++){
										if( aexp[z].hasOwnProperty('features')){
											if( aexp[z].name=='b_color_xy'){
											
											break
											}else{
											
											await getFeatures(arep,aexp[z].features)	
											}											
										}else{
										 Object.assign(arep,JSON.parse(`{"z2m_`+aexp[z].name+`" : {"label": "`+aexp[z].name+`","val": "x","mat": "1","role": "","parsed": "","time": 0,"access":`+aexp[z].access+`}	}`))
	
									await	addState(data.payload[i],aexp[z]);

	
										}
									}
								return arep	
								}	

								devar.push(							
								  {
									"Device": H2(data.payload[i].network_address),
									"Name": 	data.payload[i].friendly_name,
									"IEEE": 	data.payload[i].ieee_address,
									"ModelId":	data.payload[i].model_id,
									"Location": "z2m",
									"EP": {},
									"Report": rep,
									"DevType": "Z2M",									
									"definition": data.payload[i].definition
								  }
								)
							}
					}					
				
				return devar;	
}


		async function addState(dpi,exp){
			var atr_type;
					switch (exp.type)
					{
			 //           case "binary":
			 //              atr_type='boolean'; 
			//				break;
						case "numeric":
						   atr_type='number'; 
							break;				
							
						default :
						//string/number/boolean
						atr_type='string';
					}
			try{var label=(dpi.hasOwnProperty('friendly_name')) ?	dpi.friendly_name :	dpi.ieee_address}catch{var label='undefined';}		
			
			await adapter.createStateAsync('dev',label, exp.name, {
							name: exp.name, 
							type: atr_type ,	
							role:'state', 
							read:true,
							write: true,
					native: {},		
				})		
		
		}


		function H2(input, base) {return input.toString(16).padStart( 4, 0).toUpperCase();}
		z2m_command=function(ieee,pl_name,val){
			z2m_send('{"payload":{"'+pl_name+'":"'+val+'"},"topic":"'+ieee+'/set"}')
			adapter.log.info('{"payload":{"'+pl_name+'":"'+val+'"},"topic":"'+ieee+'/set"}')
		} 

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
    // Export startAdapter in compact mode
    module.exports = startAdapter;
} else {
    // otherwise start the instance directly
    startAdapter();
}
