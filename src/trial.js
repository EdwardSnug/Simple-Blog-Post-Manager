const apiEndpoint = "http://localhost:3000/blog";

document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault();
    //Display our already exixsting database data
    const displaySection = document.querySelector("#display");
    const cardBody = document.querySelector("#card-body");
    //fetch Request to return data from our server to our blog posts headings only
    const blogposts = document.querySelector("#orderedLists");
    try {
        fetch(apiEndpoint)
            .then(res => res.json())
            .then(data => {
                data.forEach(element => {
                    //Get the existing blog data headings from our server
                    const listItem = document.createElement("li");
                    const button = document.createElement("button");
                    button.textContent = element.heading;
                    //Lets generate class name for our button
                    button.classList.add("blog-button");
                    //Store Id  in button for unique reference
                    button.dataset.id = element.id;
                    listItem.appendChild(button);
                    blogposts.appendChild(listItem);
                });
            })

    } catch (error) {
        console.log(error);
    }
    //Initialize to display our form to input data
    const formy = document.getElementById('myform')
    const initFormButton = document.getElementById("initform");
    initFormButton.addEventListener("click", () => {
        //Display the form input fields for data creating a blog
        formy.style.display = "flex";
        formy.style.flexDirection = "column";
        //Hide the button for create new form
        initFormButton.style.display = "none"
    })

    //Get request to return data when a heading in blog posts is clicked
    //Get specific data depending on button click to heading buttons
    blogposts.addEventListener("click", (event) => {
        if (event.target.tagName === "BUTTON") {
            //Populate its ID to uniquely identify it
            const blogId = event.target.dataset.id;
            //Get request
            fetch(`${apiEndpoint}/${blogId}`)
                .then(res => res.json())
                .then(blogdta => {
                    //Lets initializa our display block
                    //Override initial display of none to block for our form display
                    displaySection.style.display = "block";
                    //Select the fields of our form and populating them with some data
                    document.querySelector("#displayTitle").textContent = blogdta.heading;
                    document.querySelector(".card-subtitle").textContent = `By: ${blogdta.authorname}`;
                    document.querySelector("#imgurl").innerHTML = `<img src="${blogdta.imageURL}" class="img-fluid" alt="Blog Image">`;
                    document.querySelector("#displaycomments").innerHTML = blogdta.comments.map(comment => `<li>${comment}</li>`).join("");
                })
                .catch(error => console.error("Error fetching blog: ", error));
        }
    })
    //POST method on submitting our form
    //collecting our data from the form
    formy.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(formy);
        const myBlog = {};
        formData.forEach((value, key) => {
            myBlog[key] = value;
        });
        //Send data after its prepared
        pushdta(myBlog);
    })
    //sending the data to our server
    const pushdta = (obj) => {
        fetch(apiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        })
            .then(res => res.json())
            .then(data => {
                alert("New Blog Data sent successfully")
                //Add to our blog post Heading
                const listItem = document.createElement("li");
                const button = document.createElement("button");
                button.textContent = data.heading;
                button.classList.add("blog-button");
                button.dataset.id = data.id;
                listItem.appendChild(button);
                blogposts.appendChild(listItem);

                formy.reset(); // clear the form
                formy.style.display = "none"; // optionally hide form
                initFormButton.style.display = "inline-block"; // show the 'create form' button again
            })
            .catch(error => console.log(`Data not sent`, error))
    }

    //Editing(POST/PATCH) method

    let currentEditId = null;
    let isEditing = false;
    //select our edit button and add an eventListener
    document.querySelector("#editbtn").addEventListener("click", () => {
        //Show form for editing
        formy.style.display = "flex";
        formy.style.flexDirection = "column"
        initFormButton.style.display = "none";
        //Track state of editing changing it to true
        isEditing = true;
        currentEditId = blogdta.id;
        // Pre-fill the form with blog data
        document.querySelector("#title").value = blogdta.heading;
        document.querySelector("#authorName").value = blogdta.authorname;
        document.querySelector("#imgUrl").value = blogdta.imageURL;

        // Join comment array to string
        document.querySelector("#comments").value = blogdta.comments.join("\n");
    })
    //Lets handle our edit post
    formy.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(formy);
        const myBlog = {};

        formData.forEach((value, key) => {
            if (key === "comments") {
                // Split multiline comments into array
                myBlog[key] = value.split("\n").filter(line => line.trim() !== "");
            } else {
                myBlog[key] = value;
            }
        });

        if (isEditing && currentEditId !== null) {
            updateBlog(currentEditId, myBlog);
        } else {
            pushdta(myBlog);
        }
    });
    const updateBlog = (id, obj) => {
        fetch(`${apiEndpoint}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(obj)
        })
            .then(res => res.json())
            .then(data => {
                alert("Blog updated successfully!");
                formy.reset();
                formy.style.display = "none";
                initFormButton.style.display = "inline-block";
                isEditing = false;
                currentEditId = null;

                // Optionally reload the page or update only the title button
                location.reload();
            })
            .catch(error => console.error("Update failed:", error));
    };

    //Deleting Blogs
    document.querySelector("#deletebtn").addEventListener("click", () => {
  const confirmDelete = confirm("Are you sure you want to delete this blog post?");
  if (confirmDelete && blogdta.id) {
    deleteBlog(blogdta.id);
  }
});

const deleteBlog = (id) => {
  fetch(`${apiEndpoint}/${id}`, {
    method: "DELETE"
  })
    .then(res => res.ok && alert("Blog post deleted successfully."))
    .then(() => {
      // Remove blog button from the list
      const allButtons = document.querySelectorAll(".blog-button");
      allButtons.forEach(btn => {
        if (btn.dataset.id === String(id)) {
          btn.parentElement.parentElement.remove(); // remove <li>
        }
      });

      // Optionally hide the display panel
      displaySection.style.display = "none";
    })
    .catch(error => console.error("Delete failed:", error));
};

})