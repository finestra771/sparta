import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { getDocs } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

// firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCdAbo_ViOKm3gYiMKDm1a4PLzvQXjK6IQ",
    authDomain: "team-followme-miniproject.firebaseapp.com",
    projectId: "team-followme-miniproject",
    storageBucket: "team-followme-miniproject.appspot.com",
    messagingSenderId: "475357059255",
    appId: "1:475357059255:web:59ae12e37a4ee731b85532",
    measurementId: "G-KHREYSMK6P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 음악 랭킹
fetch("https://raw.githubusercontent.com/KoreanThinker/billboard-json/main/billboard-hot-100/recent.json").then(res => res.json()).then(data => {
    let rows = data['data']
    rows.forEach((a, index) => {
        if (index < 5) {
            console.log(a)

            let title = a['name']
            let name = a['artist']
            let image = a['image']


            let temp_html = `<div class="card">
            <img src="${image}" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${name}</p>
            </div>
        </div>`;
            $('#rank-card').append(temp_html)
        }

    })
})

// 검색 버튼 클릭 이벤트
$("#searchBtn").click(async function () {
    let searchStr = document.getElementById('search').value;
    console.log(searchStr);
    let videoId = searchStr.split("v=")[1].split("&")[0];
    console.log(videoId);
    let iframe = document.getElementById('videoIframe');
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    iframe.src = embedUrl;

    let url_snippet = `https://www.googleapis.com/youtube/v3/videos?part=snippet&key=AIzaSyAIyGyJLimC1Oo9r8_bNWQBVwsLndCsDLk&id=${videoId}`;
    let url_stat = `https://www.googleapis.com/youtube/v3/videos?part=statistics&key=AIzaSyAIyGyJLimC1Oo9r8_bNWQBVwsLndCsDLk&id=${videoId}`;

    fetch(url_snippet).then(res => res.json()).then(data => {
        let title = data['items'][0]['snippet']['title'];
        let description = data['items'][0]['snippet']['description'];
        let channelName = data['items'][0]['snippet']['channelTitle'];

        $('#title').text(title);
        $('#video_description').text(description);
        $('#channelName').text(channelName);

        let suggestion_api = `https://www.googleapis.com/youtube/v3/search?key=AIzaSyAIyGyJLimC1Oo9r8_bNWQBVwsLndCsDLk&q=${title}`;
        fetch(suggestion_api).then(res => res.json()).then(data => {
            let suggestion_video_1 = data['items'][0]['id']['videoId'];
            const suggestionUrl_1 = `https://www.youtube.com/${suggestion_video_1}`;
            console.log(suggestionUrl_1);
            document.getElementById('video_title_1').href = suggestionUrl_1;
            fetch(suggestionUrl_1).then(res => res.json()).then(data => {
                let video_1_title = data['items'][0]['snippet']['title'];
                $('#video_title_1').text(video_1_title);
            })
        })
    })
    fetch(url_stat).then(res => res.json()).then(data => {
        let likeCount = data['items'][0]['statistics']['likeCount'];
        let views = data['items'][0]['statistics']['viewCount'];

        $('#video_like').text(likeCount);
        $('#video_views').text(views);
    })
})

// 댓글 저장 버튼 클릭 이벤트
// 댓글 입력시 db에 저장 후 새로고침 필요
$("#co_btn").click(async function () {
    let id;
    let writer = $("#co_writer_input").val();
    let star = $("#co_star").val();
    let comment = $("#co_input").val();
    comment = comment.replaceAll('\n', '<br>');
    let doc = {
        'id': '0000',
        'writer': writer,
        'star': star,
        'comment': comment
    };
    await addDoc(collection(db, "test"), doc);
    location.reload();
})

// 댓글 출력
//db 데이터 불러오기 동일한 id값만
let id = "0000";
let docs = await getDocs(collection(db, "test"));
$("#commentBlock").empty();
docs.forEach((doc) => {
    let row = doc.data();
    let writer = row['writer'];
    let star = row['star'];
    let comment = row['comment'];
    let tempHtml = `
        <div class="card mb-3">
    <div class="card-body w p">
        <!-- 댓글 작성자명 -->
    <div id = "co_writer" class="card-header">${writer}</div>
        <div class="card-body">
            <!-- 별점 -->
            <p id="co_vites" class="card-text co">${valueToStar(star)}</p>
            <!-- 댓글 -->
            <p id="co_text" class="card-text co">${comment}</p>
        </div>
</div>
</div>`;
    if (row['id'] == id)
        $("#commentBlock").append(tempHtml);
});

// 별표시 함수
function valueToStar(value) {
    let star;
    let val = Number(value);
    switch (val) {
        case 1:
            star = '⭐'; break;
        case 2:
            star = '⭐⭐'; break;
        case 3:
            star = '⭐⭐⭐'; break;
        case 4:
            star = '⭐⭐⭐⭐'; break;
        case 5:
            star = '⭐⭐⭐⭐⭐'; break;
    }
    return star;
}