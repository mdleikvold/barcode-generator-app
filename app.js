const $ = (selector) => document.querySelector(selector);
const input = $('#codeInput');
const barcode = $('#barcode');
const qr = $('#qrcode');
const empty = $('#emptyState');
let mode = 'barcode';
let qrInstance;

function setRangeFill(el) { el.style.setProperty('--fill', `${((el.value - el.min) / (el.max - el.min)) * 100}%`); }
function render() {
  const value = input.value.trim();
  $('#charCount').textContent = input.value.length;
  empty.classList.toggle('hidden', Boolean(value));
  barcode.classList.toggle('hidden', !value || mode !== 'barcode');
  qr.classList.toggle('hidden', !value || mode !== 'qr');
  if (!value) return;
  if (mode === 'barcode') {
    JsBarcode(barcode, value, { format:'CODE128', lineColor:'#171916', width:Number($('#lineWidth').value), height:104, displayValue:$('#showText').checked, font:'DM Mono', fontSize:14, margin:2, background:'#fffefa' });
  } else {
    qr.replaceChildren();
    qrInstance = new QRCode(qr, { text:value, width:Number($('#qrSize').value), height:Number($('#qrSize').value), colorDark:'#171916', colorLight:'#fffefa', correctLevel:QRCode.CorrectLevel[$('#qrLevel').value] });
  }
}
function setMode(next) {
  mode = next;
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.mode === mode));
  $('.barcode-options').classList.toggle('hidden', mode !== 'barcode'); $('.qr-options').classList.toggle('hidden', mode !== 'qr');
  $('#previewType').textContent = mode === 'barcode' ? 'CODE 128' : 'QR CODE';
  $('#fieldHint').textContent = mode === 'barcode' ? 'Letters, numbers, and symbols all work with Code 128.' : 'Links, text, contact details, and more.';
  $('#scanNote').textContent = mode === 'barcode' ? 'Optimized for retail, inventory and asset labels.' : 'A quick scan can open the information instantly.';
  render();
}
function toast(message) { const t=$('#toast'); t.textContent=message; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'), 1900); }
function download() {
  if (!input.value.trim()) return toast('Enter a value first');
  const a=document.createElement('a');
  if (mode === 'barcode') { const source=new XMLSerializer().serializeToString(barcode); a.href='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source); a.download='barcode-code128.svg'; }
  else { const canvas=qr.querySelector('canvas'); const img=qr.querySelector('img'); a.href=canvas ? canvas.toDataURL('image/png') : img.src; a.download='qr-code.png'; }
  a.click(); toast('Download started');
}
document.querySelectorAll('.nav-item').forEach((button)=>button.addEventListener('click',()=>setMode(button.dataset.mode)));
input.addEventListener('input', render); $('#lineWidth').addEventListener('input',(e)=>{ $('#widthValue').textContent=e.target.value; setRangeFill(e.target); render(); });
$('#showText').addEventListener('change',render); $('#qrSize').addEventListener('input',(e)=>{ $('#sizeValue').textContent=`${e.target.value}px`; setRangeFill(e.target); render(); }); $('#qrLevel').addEventListener('change',render);
$('#downloadButton').addEventListener('click',download); $('#copyButton').addEventListener('click',async()=>{ if(!input.value) return toast('Enter a value first'); await navigator.clipboard.writeText(input.value); toast('Value copied'); });
document.querySelectorAll('input[type="range"]').forEach(setRangeFill); render();
