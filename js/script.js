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
                    fetch(video_1_url).then(res => res.json()).then(data => {
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
