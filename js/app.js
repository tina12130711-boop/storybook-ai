// app.js for 繪本製造機 (完整互動版 - 假資料產生)
const QUESTIONS = [
  "請給你的主角取一個名字（例如：小綠）",
  "主角最喜歡的東西是什麼？",
  "主角最不喜歡的東西是什麼？",
  "主角的任務是什麼？（寫一件事）",
  "主角遇到的第一個朋友是誰？",
  "他們遇到的困難是什麼？",
  "主角用了什麼方法解決問題？",
  "旅程結束時，主角學到什麼？",
  "請寫出故事的簡短結尾（2 句）",
  "最後，寫一句鼓勵大家做環保的話（短句）"
];

let answers = [];
let current = 0;
let storyKey = 'eco-hero';
const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  if ($('story-title')) {
    const params = new URLSearchParams(location.search);
    storyKey = params.get('story') || 'eco-hero';
    const titleMap = {
      'eco-hero':'環保小勇士',
      'future-2050':'你好，2050！',
      'local-trip':'歹丸走透透',
      'career-dream':'未來不是夢'
    };
    $('story-title').innerText = titleMap[storyKey] || '繪本製造機';
    $('cover-img').src = `assets/images/${storyKey}-cover.svg`;
    $('thumb').src = `assets/images/${storyKey}-page.svg`;

    $('btn-start').addEventListener('click', () => {
      document.getElementById('intro').classList.add('hidden');
      document.getElementById('question-area').classList.remove('hidden');
      showQuestion(0);
    });
    $('prev-btn').addEventListener('click', onPrev);
    $('next-btn').addEventListener('click', onNext);
  }

  if ($('book')) {
    buildFromLocal();
    $('download').addEventListener('click', downloadPDF);
  }
});

function showQuestion(i){
  current = i;
  $('q-number').innerText = `第 ${i+1} 題`;
  $('q-text').innerText = QUESTIONS[i];
  $('q-input').value = answers[i] || '';
  $('thumb').src = `assets/images/${storyKey}-page.svg`;
  $('prev-btn').style.display = i===0 ? 'none' : 'inline-block';
  $('next-btn').innerText = i===QUESTIONS.length-1 ? '完成' : '下一題';
}

function onNext(){
  const val = $('q-input').value.trim();
  answers[current] = val;
  if (current < QUESTIONS.length-1) {
    showQuestion(current+1);
  } else {
    localStorage.setItem('storybook_answers', JSON.stringify({key:storyKey,answers:answers}));
    document.getElementById('question-area').classList.add('hidden');
    document.getElementById('waiting').classList.remove('hidden');
    setTimeout(() => {
      location.href = 'result.html';
    }, 1500);
  }
}

function onPrev(){
  answers[current] = $('q-input').value.trim();
  showQuestion(Math.max(0,current-1));
}

function buildFromLocal() {
  const data = JSON.parse(localStorage.getItem('storybook_answers') || '{}');
  const key = data.key || 'eco-hero';
  const ans = data.answers || [];
  const title = (ans[0] || '小主角') + ' 的冒險';
  const pages = [];
  for (let i=0;i<6;i++){
    const text = ans[i] ? ans[i] : (i===0? '從前有個主角' : '故事片段');
    pages.push({text: text, image: `assets/images/${key}-page.svg`});
  }
  const book = $('book');
  book.innerHTML = '';
  const h = document.createElement('h3');
  h.innerText = title;
  book.appendChild(h);
  pages.forEach((p,idx) => {
    const div = document.createElement('div');
    div.className = 'book-page';
    div.innerHTML = `<img src="${p.image}" alt="插圖"><div><p><strong>第 ${idx+1} 頁</strong></p><p>${p.text}</p></div>`;
    book.appendChild(div);
  });
}

function downloadPDF(){
  const element = document.getElementById('book');
  const opt = { margin: 10, filename: 'my-story.pdf', image: {type:'jpeg', quality:0.98}, html2canvas: {scale:2}, jsPDF:{unit:'mm', format:'a4', orientation:'portrait'} };
  html2pdf().set(opt).from(element).save();
}
