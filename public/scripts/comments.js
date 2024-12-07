const loadCommentBtn = document.getElementById("load-comment-btn");
const commentSection = document.getElementById("comments");

function createCommentList(comments) {
  const commentList = document.createElement("ol");

  for (const comment of comments) {
    const commentElement = document.createElement("li");
    commentElement.innerHTML = `
        <article class="comment-item">
            <h2>${comment.title}</h2>
            <p><${comment.text}</p>
        </article>
        `;
    commentList.appendChild(commentElement);
  }
  return commentList;
}

async function loadCommentFetch() {
  const postId = loadCommentBtn.dataset.postid;
  const response = await fetch(`/posts/${postId}/comments`); // posts/:id/comment라는 경로로 GET 요청 전송
  const responseData = await response.json();

  const commentListElement = createCommentList(responseData);
  commentSection.innerHTML = '';
  commentSection.appendChild(commentListElement);
}

loadCommentBtn.addEventListener('click',loadCommentFetch);


