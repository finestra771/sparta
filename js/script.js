<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>음악 검색 및 재생 페이지</title>
    <!-- 부트스트랩 로드 부분입니다. -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <!-- jquery 로드 부분입니다. -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <!-- 스크립트 로드 -->
    <script type="module">
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
    </script>
</head>
<link rel="stylesheet" href="./css/style.css" />

<body>
    <!-- 검색 시작 -->
    <div class="input-group mb-3">
        <!-- 검색 -->
        <input id="search" type="text" class="form-control" placeholder="Youtube Link 입력" aria-label="Youtube Link 입력"
            aria-describedby="button-addon2">
        <button id="searchBtn" class="btn btn-outline-secondary" type="button" id="button-addon2">검색</button>
    </div>
    <!-- 검색 끝 -->
    음악 랭킹
    <!-- 음악 랭킹 시작 -->
    <div class="card-group" id="rank-card">
    </div>

    <!-- 음악 랭킹 끝 -->
    <!-- 동영상 정보 시작 -->
    <div class="card mb-3 mt-3">
        <!-- 동영상 player 작성 -->
        <div id="video" class="card">
            <iframe id="videoIframe" width=100% height=100% src="https://www.youtube.com/embed/RwmcrmMABG0"
                title="알고리즘 코딩테스트 문제풀이 강의  - 5  나머지 합 구하기 (백준 10986)" frameborder="0"
                allow="accelerometer; autoplay; clipboard\index.html-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
        </div>
        <!-- 동영상 설명 시작 -->
        <div class="card-body w">
            <div class="row g-3">
                <div class="col-sm-10">
                    <!-- 동영상 제목 -->
                    <h5 id="title">Card title</h5>
                </div>
                <div class="col-sm">
                    <img src="./images/thumb_up.svg">
                </div>
                <div class="col-sm">
                    <!-- 좋아요 -->
                    <h5 id="video_like" class="card-title">100</h5>
                </div>
            </div>
            <h5 class="card-title views">조회수: <span id="video_views"></span>회</h5>
            <h5 id="channelName" class="card-title views">채널 이름</h5>
            <!-- 동영상 설명 -->
            <p id="video_description" class="card-text">동영상 설명 부분입니다.</p>
        </div>
        <!-- 동영상 정보 끝 -->
    </div>
    <div class="card-group">
        <div class="card">
            <img id="suggestionUrl_1" src="" class="card-img-top" alt="...">
            <div class="card-body">
                <h5 id="video_title_1" class="card-title" href="">Card title</h5>
                <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional
                    content. This content is a little bit longer.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
        <div class="card">
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">This card has supporting text below as a natural lead-in to additional content.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
        <div class="card">
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">This is a wider card with supporting text below as a natural lead-in to additional
                    content. This card has even longer content than the first to show that equal height action.</p>
                <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
            </div>
        </div>
    </div>
    <!-- 댓글 작성 시작 -->
    <div class="card mb-3">
        <div class="card-body w p">
            <!-- 댓글 작성자명 -->
            <div id="co_writer" class="card-header p">
                <input id="co_writer_input" type="text" class="form-control" placeholder="작성자 입력"
                    aria-label="Youtube Link 입력" aria-describedby="button-addon2">
            </div>
            <!-- 별점 선택 -->
            <div class="input-group">
                <label class="input-group-text" for="inputGroupSelect01">별점</label>
                <select class="form-select" id="co_star">
                    <option selected>별점선택</option>
                    <option value="1">⭐</option>
                    <option value="2">⭐⭐</option>
                    <option value="3">⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐⭐</option>
                    <option value="3">⭐⭐⭐⭐⭐</option>
                </select>
            </div>
            <div class="form-floating">
                <!-- 댓글 입력 -->
                <textarea class="form-control" id="co_input" style="height: 100px"></textarea>
                <label for="floatingTextarea2">Comments</label>
            </div>
            <button id="co_btn" class="btn btn-secondary w">댓글 작성</button>
        </div>
    </div>
    <!-- 댓글 작성 끝 -->
    <!-- 댓글 조회 시작 -->
    <div class="card mb-3">
        <div class="card-body w p">
            <!-- 댓글 작성자명 -->
            <div id="co_writer" class="card-header">작성자명</div>
            <div class="card-body">
                <!-- 별점 -->
                <p id="co_vites" class="card-text co">⭐⭐⭐⭐⭐</p>
                <!-- 댓글 -->
                <p id="co_text" class="card-text co">이곳은 댓글을 작성하는 곳 입니다.</p>
            </div>
        </div>
    </div>
    <!-- 부트스트랩 로드 부분입니다. -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
        crossorigin="anonymous"></script>
</body>

</html>
