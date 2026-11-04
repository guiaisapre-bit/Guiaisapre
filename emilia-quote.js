/* Cotización guiada en la web: se envía solo tras revisar y confirmar. */
(()=>{
 const host=document.querySelector('.advisor');if(!host)return;
 const content=host.querySelector('.advisor-content'),message=host.querySelector('#advisor-message');
 const fields=[
  {key:'nombre',label:'¿Cómo te llamas?',type:'text',autocomplete:'name'},
  {key:'edad',label:'¿Qué edad tienes?',type:'number',min:18,max:99},
  {key:'isapre',label:'¿En qué sistema de salud estás?',options:['Fonasa','Banmédica','Colmena','Consalud','Cruz Blanca','Nueva Masvida','Esencial','Vida Tres','Otra / no sé']},
  {key:'preocupa',label:'¿Qué te gustaría mejorar de tu plan?',type:'text'},
  {key:'renta',label:'¿Cuál es tu renta imponible aproximada?',options:['$800.000 - $1.000.000','$1.000.000 - $1.500.000','$1.500.000 - $2.000.000','$2.000.000 - $2.500.000','Más de $3.000.000','Otro monto / prefiero conversar']},
  {key:'cargas',label:'¿Quieres incluir cargas familiares?',options:['No','Sí']},
  {key:'edadesCargas',label:'¿Qué edades tienen tus cargas?',type:'text',when:d=>d.cargas==='Sí'},
  {key:'clinicas',label:'¿Qué clínicas prefieres?',type:'text'},
  {key:'telefono',label:'¿Cuál es tu teléfono de contacto?',type:'tel',autocomplete:'tel'},
  {key:'email',label:'¿Cuál es tu correo electrónico?',type:'email',autocomplete:'email'},
  {key:'viaContacto',label:'¿Cómo prefieres que nuestra asesora de salud te contacte?',options:['Llamada','WhatsApp']}
 ];
 const data={preexistencia:'No consultada',preexistenciaDetalle:'',edadesCargas:''};let index=0,sending=false,sent=false;
 const form=document.createElement('form');form.className='emilia-quote';form.hidden=true;content.append(form);
 function button(text,action,type='button'){const b=document.createElement('button');b.type=type;b.textContent=text;if(action)b.addEventListener('click',action);return b;}
 function start(){Array.from(content.children).forEach(e=>{if(e!==message&&e!==form)e.hidden=true});form.hidden=false;render();}
 function cancel(){form.hidden=true;Array.from(content.children).forEach(e=>{if(e!==form)e.hidden=false});message.textContent='Aquí estoy para ayudarte. Puedes revisar tus dudas o retomar tu cotización.';}
 function move(direction){do{index+=direction;}while(fields[index]?.when&&!fields[index].when(data));render();}
 function render(){form.replaceChildren();message.textContent=sent?'Tu solicitud fue recibida para su envío a nuestra asesora de salud.':index<fields.length?'Te ayudo a solicitar tu cotización, paso a paso. No necesitas escribir diagnósticos ni enviar documentos médicos aquí.':'Revisa tu información antes de enviarla a nuestra asesora de salud.';
  if(sent){form.append(button('Volver a las preguntas',cancel));return;}
  const progress=document.createElement('small');progress.textContent=index<fields.length?'Dato '+(index+1)+' de '+fields.length:'Revisión final';form.append(progress);
  if(index>=fields.length){review();return;}
  const field=fields[index],label=document.createElement('label');label.htmlFor='emilia-answer';label.textContent=field.label;form.append(label);
  let input;
  if(field.options){input=document.createElement('select');const empty=document.createElement('option');empty.value='';empty.textContent='Selecciona una opción';input.append(empty);for(const value of field.options){const option=document.createElement('option');option.value=value;option.textContent=value;input.append(option);}}
  else {input=document.createElement('input');input.type=field.type;input.maxLength=field.type==='email'?254:160;if(field.min)input.min=field.min;if(field.max)input.max=field.max;if(field.autocomplete)input.autocomplete=field.autocomplete;}
  input.id='emilia-answer';input.name=field.key;input.required=true;input.value=data[field.key]||'';form.append(input);
  const error=document.createElement('p');error.className='emilia-error';error.setAttribute('role','alert');form.append(error);
  form.onsubmit=e=>{e.preventDefault();input.setCustomValidity('');const value=input.value.trim();if(!value)input.setCustomValidity('Completa este dato para continuar.');if(field.key==='telefono'&&!/^\+?[\d\s()-]{8,20}$/.test(value))input.setCustomValidity('Ingresa un teléfono válido con su código de país.');if(field.key==='edad'&&(!Number.isInteger(Number(value))||+value<18||+value>99))input.setCustomValidity('Ingresa una edad entre 18 y 99 años.');if(!input.reportValidity())return;data[field.key]=value;move(1);};
  form.append(button('Continuar →',null,'submit'));if(index>0)form.append(button('← Volver',()=>move(-1)));form.append(button('Volver a las preguntas',cancel));input.focus({preventScroll:true});content.scrollTop=0;
 }
 function review(){form.onsubmit=e=>e.preventDefault();const list=document.createElement('dl');for(const f of fields){if(f.when&&!f.when(data))continue;const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=f.label;value.textContent=data[f.key];list.append(term,value);}form.append(list);
  const privacy=document.createElement('a');privacy.href='/politica-privacidad.html';privacy.textContent='Leer la política de privacidad';privacy.target='_blank';privacy.rel='noopener';form.append(privacy);
  const label=document.createElement('label');label.className='emilia-consent';const consent=document.createElement('input');consent.type='checkbox';label.append(consent,document.createTextNode('Autorizo enviar estos datos al equipo de Guía Isapre para que nuestra asesora de salud me contacte por llamada o WhatsApp sobre mi cotización.'));form.append(label);
  const status=document.createElement('p');status.className='emilia-error';status.setAttribute('role','status');form.append(status);
  const send=button('Enviar mi solicitud a nuestra asesora de salud',async()=>{if(sending||sent)return;if(!consent.checked){status.textContent='Confirma tu autorización antes de enviar.';return;}sending=true;send.disabled=true;back.disabled=true;send.textContent='Enviando…';status.textContent='';
   try{const response=await fetch('https://hook.us2.make.com/yfj4va4gh782bifrql8uizmaq4uj7kdx',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,origen:'EmilIA · web Guía Isapre'})});if(!response.ok)throw new Error('not_received');sent=true;render();}
   catch{status.textContent='No pudimos confirmar el envío. Puedes volver a intentarlo.';send.disabled=false;back.disabled=false;send.textContent='Reintentar envío';}finally{sending=false;}
  });const back=button('← Corregir mis datos',()=>move(-1));form.append(send,back);content.scrollTop=0;
 }
 host.querySelector('[data-advisor="form"]').addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();start();},true);
})();
