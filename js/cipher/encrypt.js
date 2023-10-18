
// 页面加载
//var token = $.cookie("Blog.IWiki.token");
var token = "";
if (isEmpty(token)) {
    var html = '<div class="style-center" onclick="decryptHtml()" style="cursor:pointer">'
        + '<img src="/images/000000/img_00000000000000.png">'
        + '</div>';
    $("article.markdown").prepend(html);
    $("nav#TableOfContents").prepend("<ul></ul>");
} else {
    decryptHtml();
}

// 解密html
function decryptHtml() {
    var secretKey = getSecretKey();
    if (isEmpty(secretKey)) {
        return;
    }
    try {
        // 目录：catalog
        var catalogData = $("#catalogData").text().trim();
        var catalogBase64 = decryptByAes(secretKey, catalogData);
        var catalogHtml = decodeBase64(catalogBase64);

        // 正文：content
        var contentData = $("#contentData").text().trim();
        var contentBase64 = decryptByAes(secretKey, contentData)
        var contentHtml = decodeBase64(contentBase64);

        // 文档：article
        var articleData = $("#articleData").text().trim();
        var articleBase64 = decryptByAes(secretKey, articleData);
        var articleHtml = '<div id="articleBase64" class="style-hide">' + articleBase64 + '</div>';

        // fileName
        var fileNameHtml = $("#fileName").prop("outerHTML");

        // 生成html
        $("article.markdown").remove();
        $("nav#TableOfContents").remove();
        $("div.book-toc-content").prepend(catalogHtml);
        $("header.book-header").after(contentHtml);
        $("div.book-page").append(articleHtml);
        $("div.book-page").append(fileNameHtml);
    } catch (error) {
        alert("解码错误！");
        return;
    }

    var html =  '<div style="margin-bottom:1rem;">'
        + '<div style="margin-bottom: 0.5rem">'
        + '<button type="button" onclick="downloadSrcFile()" style="color:#A5A5A5">下载文件</button>'
        + '</div>'
        + '<div style="margin-bottom: 0.5rem">'
        + '<button type="button" onclick="encryptSrcFile()" style="color:#A5A5A5">加密文件</button>'
        + '<input type="text" id="srcFileName" readonly="readonly" class="style-hide">'
        + '<input type="file" id="uploadSrcFile" class="style-hide" accept=".md"/>'
        + '</div>'
        + '</div>';
    $("div.book-toc-content").prepend(html);
}

// 下载原文件
function downloadSrcFile() {
    var fileName = $("#fileName").text().trim();
    var articleBase64 = $("#articleBase64").text().trim();
    var article = decodeBase64(articleBase64);
    var blob = new Blob([article], { type: "text/plain" });
    saveAs(blob, fileName);
}

// 加密原文件
function encryptSrcFile() {
    document.getElementById("uploadSrcFile").click();
    $("#uploadSrcFile").change(function () {
        var filePath = $("#uploadSrcFile").val();
        if (filePath.indexOf(".md") != -1 && filePath.lastIndexOf("\\")) {
            var fileName = filePath.substr(filePath.lastIndexOf("\\") + 1);
            $("#srcFileName").val(fileName);
        } else {
            return;
        }

        var file = document.getElementById("uploadSrcFile").files[0];
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function () {
            var article = this.result;
            var articleHead = article.substring(0, article.indexOf("---", 10) + 3);
            debugger
            var articleBase64 = encodeBase64(article);
            $("#articleHead").remove();
            $("#articleBase64").remove();
            var html = '<div id="articleHead" class="style-hide">' + articleHead + '</div>\n'
                + '<div id="articleBase64" class="style-hide">' + articleBase64 + '</div>';
            $("div.book-page").append(html);
            encryptAndDownloadFile();
        }
    });
}

// 加密并下载文件
function encryptAndDownloadFile() {
    var secretKey = getSecretKey();
    if (isEmpty(secretKey)) {
        return;
    }

    var fileName = $("#srcFileName").val();
    if (isEmpty(fileName)) {
        alert("请上传原文本文件！");
        return;
    }

    // 目录：catalog
    var catalogHtml = $("nav#TableOfContents").prop("outerHTML");
    var catalogBase64 = encodeBase64(catalogHtml);
    var catalogData = encryptByAes(secretKey, catalogBase64);

    // 正文：content
    var contentHtml = $("article.markdown").prop("outerHTML");
    var contentBase64 = encodeBase64(contentHtml);
    var contentData = encryptByAes(secretKey, contentBase64);

    // 文档：article
    var articleBase64 = $("#articleBase64").text();
    var articleData = encryptByAes(secretKey, articleBase64);

    // 下载文件
    var articleBody = '<div class="style-hide">\n\n'
        + '<p id="catalogData">' + catalogData + '</p>\n\n'
        + '<p id="contentData">' + contentData + '</p>\n\n'
        + '<p id="articleData">' + articleData + '</p>\n\n'
        + '<p id="fileName">' + fileName + '</p>\n\n'
        + '</div>';
    var text = $("#articleHead").text() + "\n\n" + articleBody;
    var blob = new Blob([text], { type: "text/plain" });
    saveAs(blob, fileName);
}

// 临时加密
function encryptText() {
    var pwd = "";
    var key = "";

    var md5 = CryptoJS.MD5(key).toString().toUpperCase();
    console.log("MD5：" + md5);
    var ciphertext = encryptByAes(pwd, md5);
    console.log("AES：" + ciphertext);
    console.log("解密：" + decryptByAes(pwd, ciphertext));
}