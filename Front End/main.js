// var promise = import("string.js");
var name = '';
var encoded = null;
var fileExt = null;
var SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone');
function submitSearch(e) {
  console.log(e)
    console.log(document.getElementById("input-search").value);
    var apigClient = apigClientFactory.newClient();

    var params = {
        'q': document.getElementById("input-search").value,
        "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"", "Access-Control-Allow-Methods":"*"
    };

    console.log(params)

    apigClient.searchGet(params, {}, {})
        .then(function (result) {
            console.log("result",result);
            img_paths = result["data"]["body"]["imagePaths"];
            console.log("image_paths", img_paths);
            //console.log(img_paths.substring(1,img_paths.length-1))  
            // result["data"]["body"]["imagePaths"][0]
            
            var div = document.getElementById("imgDiv");
            div.innerHTML = "";

            // var j;
            // for(j = 0; j < img_paths.length; j++) {
            //     img_ls = img_paths[j].split('/');
            //     img_name = img_ls[img_ls.length-1];
            //     div.innerHTML += '<figure><img src="' + img_paths[j] + 
            //         '" style="width:25%"><figcaption>' 
            //         + img_name + '</figcaption></figure>';
            // }
            bucket = "https://image-bucket-new.s3.amazonaws.com/"
            var j;
            for(j = 0; j < img_paths.length; j++) {
                var newimg = document.createElement("img");

                  img_ls = img_paths[j].split('/');
                  img_name = img_ls[img_ls.length-1];
                  newimg.src = bucket + img_name
                  console.log("link: ",newimg.src)
                  newimg.innerHTML = img_name
                  div.appendChild(newimg)
        }
        }).catch(function (result) {
            console.log(result);
        });
}

function checkResponse(result) {
    console.log(result);
    if (result["data"]) {
        img_paths = result["data"]["body"]["imagePaths"];
        var div = document.getElementById("imgDiv");
        
        div.innerHTML = "";
        div.removeChild()
        bucket = "https://image-bucket-new.s3.amazonaws.com/"
        var j;
        for (var j = 0; j < img_paths.length; j++) {
          var newimg = document.createElement("img");
      
          var img_ls = img_paths[j].split('/');
          var img_name = img_ls[img_ls.length - 1];
          newimg.src = bucket + img_name;
          console.log("link: ", newimg.src);
      
          var classname = randomChoice(['big', 'vertical', 'horizontal', '']);
          if (classname) {
              newimg.classList.add(classname);
          }
      
          div.appendChild(newimg); // Ensure 'div' is defined and points to your container
      }
      
    }
}

//       var classname = randomChoice(['big', 'vertical', 'horizontal', '']);
//       if (classname) { newimg.classList.add(); }

//       filename = results[i].substring(results[i].lastIndexOf('/') + 1)
//       newimg.src = "https://b2-bucket-11-26.s3.amazonaws.com/" + filename;
//       newDiv.appendChild(newimg);

// function checkResponse(res) {
//     var newDiv = document.getElementById("images");
//     if (typeof (newDiv) != 'undefined' && newDiv != null) {
//       while (newDiv.firstChild) {
//         newDiv.removeChild(newDiv.firstChild);
//       }
//     }
  
//     console.log(res);
//     if (res.length == 0) {
//       var newContent = document.createTextNode("No image to display");
//       newDiv.appendChild(newContent);
//     }
//     else {
//       results = res.body.imagePaths
//       for (var i = 0; i < results.length; i++) {
//         console.log(results[i]);
//         var newDiv = document.getElementById("images");
//         //newDiv.style.display = 'inline'
//         var newimg = document.createElement("img");
//         var classname = randomChoice(['big', 'vertical', 'horizontal', '']);
//         if (classname) { newimg.classList.add(); }
  
//         filename = results[i].substring(results[i].lastIndexOf('/') + 1)
//         newimg.src = "https://photo-album-ss.s3.amazonaws.com/" + filename;
//         newDiv.appendChild(newimg);
//       }
//     }
//   }

function submitPhoto(e) {
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        alert('The File APIs are not fully supported in this browser.');
        return;
      }
      var path = (document.getElementById("input-file").value).split("\\");
      var file_name = path[path.length-1];
      console.log(file_name);
      var file = document.getElementById("input-file").files[0];
      var encoded_image = getBase64(file).then((data) => {
        //console.log(data);
        var apigClient = apigClientFactory.newClient();
        var file_type = file.type + ';base64';
        var body = data;
        var params = {
          'item': file.name,
          'folder': "bucket-final",
          'Content-Type': file.type,
          'x-amz-meta-customLabels': note_customtag.value,
          'Accept': 'image/*',
          "Access-Control-Allow-Origin":"*", "Access-Control-Allow-Headers":"", "Access-Control-Allow-Methods":"*"
        };
        console.log("reached here")
        console.log(note_customtag.value)
        var additionalParams = {
          headers:{
            "Content-Type":"image/*",
            "x-amz-meta-customLabels":note_customtag.value
          }
        };
        apigClient
          .uploadFolderItemPut(params, body, additionalParams)
          .then(function (res) {
            if (res.status == 200) {
              document.getElementById('input-file').innerHTML =
                ':) Your image is uploaded successfully!';
              document.getElementById('input-file').style.display = 'block';
            }
          });
          console.log("reached here also")
      });
      alert("Image uploaded: " + file.name);

      }
 
function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      // reader.onload = () => resolve(reader.result)
      reader.onload = () => {
        let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
        if ((encoded.length % 4) > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  }

function myFunction() {
    var x = document.getElementById("input-file");
    var txt = "";
    if ('files' in x) {
        if (x.files.length == 0) {
            txt = "Select one or more files.";
        } else {
            for (var i = 0; i < x.files.length; i++) {
                txt += "<br><strong>" + (i + 1) + ". file</strong><br>";
                var file = x.files[i];
                if ('name' in file) {
                    txt += "name: " + file.name + "<br>";
                }
                if ('size' in file) {
                    txt += "size: " + file.size + " bytes <br>";
                }
            }
        }
    } else {
        if (x.value == "") {
            txt += "Select one or more files.";
        } else {
            txt += "The files property is not supported by your browser!";
            txt += "<br>The path of the selected file: " + x.value;
        }
    }
    document.getElementById("demo").innerHTML = txt;
}

