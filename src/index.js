const apiEndpoint = "http://localhost:3000/blog";

// Global state variables
let selectedBlog = null;
let isEditing = false;
let currentEditId = null;

// DOM Elements
const formy = document.getElementById("myform");
const initFormButton = document.getElementById("initform");
const blogposts = document.querySelector("#orderedLists");
const displaySection = document.querySelector("#display");
const displayTitle = document.querySelector("#displayTitle");
const subtitle = document.querySelector(".card-subtitle");
const imgurl = document.querySelector("#imgurl");
const displaycomments = document.querySelector("#displaycomments");
const editBtn = document.querySelector("#editbtn");
const deleteBtn = document.querySelector("#deletebtn");

// Helpers
const renderBlogList = () => {
  blogposts.innerHTML = "";
  fetch(apiEndpoint)
    .then(res => res.json())
    .then(data => {
      data.forEach(blog => {
        const heading = blog.heading || blog.Title; // Fallback to Title if heading is missing
        const listItem = document.createElement("li");
        const button = document.createElement("button");
        button.textContent = heading;
        button.classList.add("blog-button");
        button.dataset.id = blog.id;
        listItem.appendChild(button);
        blogposts.appendChild(listItem);
      });
    })
    .catch(console.error);
};

const showBlog = (blog) => {
  selectedBlog = blog;
  displaySection.style.display = "block";
  const heading = blog.heading || blog.Title;
  const author = blog.authorname || blog.AuthorName;
  const image = blog.imageURL || blog.ImageUrl;
  displayTitle.textContent = heading;
  subtitle.textContent = `By: ${author}`;
  imgurl.innerHTML = `<img src="${image}" class="img-fluid">`;
  const comments = blog.comments || [];
  displaycomments.innerHTML = comments.map(c => `<li>${c}</li>`).join("");
};

const pushdta = (obj) => {
  fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  })
    .then(res => res.json())
    .then(data => {
      alert("New Blog Data sent successfully");
      renderBlogList();
      formy.reset();
      formy.style.display = "none";
      initFormButton.style.display = "inline-block";
    })
    .catch(error => console.log("Data not sent", error));
};

const updateBlog = (id, obj) => {
  fetch(`${apiEndpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  })
    .then(res => res.json())
    .then(data => {
      alert("Blog updated successfully!");
      renderBlogList();
      formy.reset();
      formy.style.display = "none";
      initFormButton.style.display = "inline-block";
      isEditing = false;
      currentEditId = null;
    })
    .catch(error => console.error("Update failed:", error));
};

const deleteBlog = (id) => {
  fetch(`${apiEndpoint}/${id}`, { method: "DELETE" })
    .then(res => res.ok && alert("Blog post deleted successfully."))
    .then(() => {
      const allButtons = document.querySelectorAll(".blog-button");
      allButtons.forEach(btn => {
        btn.dataset.id === String(id) && btn.parentElement.parentElement.remove();
      });
      displaySection.style.display = "none";
    })
    .catch(error => console.error("Delete failed:", error));
};

// Main App Logic
document.addEventListener("DOMContentLoaded", () => {
  renderBlogList();

  initFormButton.addEventListener("click", () => {
    formy.style.display = "flex";
    formy.style.flexDirection = "column";
    initFormButton.style.display = "none";
  });

  blogposts.addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      const id = e.target.dataset.id;
      fetch(`${apiEndpoint}/${id}`)
        .then(res => res.json())
        .then(showBlog)
        .catch(console.error);
    }
  });

  editBtn.addEventListener("click", () => {
    if (!selectedBlog) return;
    isEditing = true;
    currentEditId = selectedBlog.id;
    formy.style.display = "flex";
    formy.style.flexDirection = "column";
    initFormButton.style.display = "none";
    formy.heading.value = selectedBlog.heading || selectedBlog.Title;
    formy.authorname.value = selectedBlog.authorname || selectedBlog.AuthorName;
    formy.imageURL.value = selectedBlog.imageURL || selectedBlog.ImageUrl;
    formy.comments.value = (selectedBlog.comments || []).join("\n");
  });

  deleteBtn.addEventListener("click", () => {
    confirm("Are you sure you want to delete this blog post?") &&
      deleteBlog(selectedBlog.id);
  });

  formy.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(formy);

    const buildBlogData = (nextId) => {
      const myBlog = {
        id: isEditing && currentEditId ? currentEditId : nextId,
      };

      formData.forEach((value, key) => {
        myBlog[key] = key === "comments"
          ? value.split("\n").filter(line => line.trim() !== "")
          : value;
      });

      // Normalize keys to match existing DB
      myBlog.heading = myBlog.heading || myBlog.Title;
      myBlog.authorname = myBlog.authorname || myBlog.AuthorName;
      myBlog.imageURL = myBlog.imageURL || myBlog.ImageUrl;

      // Clean up alternative keys
      delete myBlog.Title;
      delete myBlog.AuthorName;
      delete myBlog.ImageUrl;

      return myBlog;
    };

    if (isEditing && currentEditId) {
      const myBlog = buildBlogData(currentEditId);
      updateBlog(currentEditId, myBlog);
    } else {
      fetch(apiEndpoint)
        .then(res => res.json())
        .then(data => {
          const maxId = data.reduce((max, blog) => Math.max(max, blog.id || 0), 0);
          const nextId = maxId + 1;
          const myBlog = buildBlogData(nextId);
          pushdta(myBlog);
        })
        .catch(err => console.error("Failed to fetch existing blogs:", err));
    }
  });
});
