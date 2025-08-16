// Nội dung MỚI cho options.js
var config = {};
var websites = [];

document.getElementById('save').addEventListener('click', save);

chrome.storage.sync.get(['config', 'websites'], function (result) {
    if (result) {
        if (result.config) {
            config = result.config;
            document.getElementById(`theme-${result.config.theme}`).checked = true;
            document.getElementById(`font-${result.config.font}`).checked = true;
            document.getElementById('zoom-range').value = result.config.zoom;
            document.getElementById('zoom-value').innerText = result.config.zoom;
        } else {
            document.getElementById('theme-light').checked = true;
            document.getElementById('font-sans').checked = true;
            document.getElementById('zoom-range').value = 1;
            document.getElementById('zoom-value').innerText = '1';
        }

        // --- ĐOẠN MÃ ĐÃ ĐƯỢC SỬA Ở ĐÂY ---
        // Hàm cũ chrome.tabs.getSelected đã bị xóa bỏ
        // Thay thế bằng chrome.tabs.query
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0]; // Lấy tab hiện tại từ mảng kết quả
            if (tab) {
                var url = new URL(tab.url);
                var hostname = url.hostname;
                document.getElementById('current-site-value').innerText = hostname;
                if (result.websites) {
                    websites = result.websites;
                    websites.forEach(website => {
                        var checkbox = document.getElementById(`website-${website.mode}`);
                        if (website.hostname == hostname) {
                            checkbox.checked = true;
                        } else {
                            // checkbox.checked = false; // This logic might be flawed if multiple sites exist
                        }
                    });
                }
            }
        });
        // --- KẾT THÚC ĐOẠN MÃ ĐÃ SỬA ---
    }
});


function save() {
    var radios = document.getElementsByTagName('input');
    var value;
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].type === 'radio' && radios[i].checked) {
            if (radios[i].name == 'theme') {
                config.theme = radios[i].value;
            } else if (radios[i].name == 'font') {
                config.font = radios[i].value;
            } else if (radios[i].name == 'website') {

                var url = new URL(document.getElementById('current-site-value').innerText);
                var hostname = "https://" + url.hostname;
                var hostname = (new URL(hostname)).hostname;

                websites = websites.filter(w => w.hostname != hostname);
                if (radios[i].value != 'normal') {
                    websites.push({
                        hostname: hostname,
                        mode: radios[i].value,
                    });
                }
            }
        }
    }

    config.zoom = document.getElementById('zoom-range').value;

    chrome.storage.sync.set({ 'config': config }, function () {
    });

    chrome.storage.sync.set({ 'websites': websites }, function () {
    });
}

document.getElementById('zoom-range').addEventListener('input', function (evt) {
    document.getElementById('zoom-value').innerText = this.value;
});
