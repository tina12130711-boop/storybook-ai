// ====== 前端故事與圖片生成 ======

const API_BASE = "https://storybook-ai-h6zg.onrender.com"; // ⭐你的 Render 後端網址

// =======================
// 送出孩子的回答產生故事
// =======================
async function generateStory() {
  const theme = document.getElementById("theme").value;
  
  const answers = {
    name: document.getElementById("q1").value,
    animal: document.getElementById("q2").value,
    color: document.getElementById("q3").value,
    dream: document.getElementById("q4").value
  };

  document.getElementById("loading").style.display = "block";

  const res = await fetch(`${API_BASE}/api/story`, {   // ⭐改成你的後端網址
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, theme })
  });

  const data = await res.json();

  if (data.story) {
    document.getElementById("story").innerText = data.story;
    document.getElementById("story-section").style.display = "block";

    // 自動切句子 → 一句一句生成插圖
    generateImagesFromStory(data.story);
  } else {
    document.getElementById("story").innerText = "故事生成失敗 QQ";
  }

  document.getElementById("loading").style.display = "none";
}

// =======================
// 自動切句 → 生成插圖
// =======================
async function generateImagesFromStory(storyText) {
  const sentences = storyText
    .split(/。|！|？|\n/)
    .map(s => s.trim())
    .filter(s => s.length > 2);

  const imgBox = document.getElementById("images");
  imgBox.innerHTML = "";

  for (let s of sentences) {
    const div = document.createElement("div");
    div.className = "img-block";
    div.innerHTML = `<p>${s}</p><p>⏳ 正在生成圖片...</p>`;
    imgBox.appendChild(div);

    try {
      const res = await fetch(`${API_BASE}/api/image`, {  // ⭐改成你的後端網址
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentence: s })
      });

      const data = await res.json();

      if (data.image) {
        const img = document.createElement("img");
        img.src = "data:image/png;base64," + data.image;
        img.className = "story-img";

        div.innerHTML = `<p>${s}</p>`;
        div.appendChild(img);
      } else {
        div.innerHTML = `<p>${s}</p><p>❌ 圖片生成失敗</p>`;
      }
    } catch (e) {
      div.innerHTML = `<p>${s}</p><p>❌ 圖片生成錯誤</p>`;
    }
  }
}
