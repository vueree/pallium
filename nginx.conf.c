http {
    server {
        listen 80;
        server_name pallium.onrender.com;

        location / {
            try_files $uri $uri/ /index.html;
        }

        error_page 500 502 503 504 /50x.html;
        location = /50x.html {
            root /usr/share/nginx/html;
        }
    }
}