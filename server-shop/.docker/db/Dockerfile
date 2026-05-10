FROM mongo:7.0.2

# Tạo thư mục cần thiết và set permissions
RUN mkdir -p /var/log/mongodb && \
    chown -R mongodb:mongodb /var/log/mongodb && \
    chmod 755 /var/log/mongodb

# Copy MongoDB configuration file
COPY mongod.conf /etc/mongod.conf

# Tạo thư mục scripts cho init
RUN mkdir -p /scripts

# Set permissions cho config file
RUN chown mongodb:mongodb /etc/mongod.conf && \
    chmod 644 /etc/mongod.conf

# Tạo startup script để đảm bảo permissions
RUN echo '#!/bin/bash\n\
    # Đảm bảo thư mục log và data tồn tại\n\
    mkdir -p /var/log/mongodb /data/db\n\
    \n\
    # Khởi động MongoDB trực tiếp (chạy với user root của container để tránh lỗi permission trên Windows volumes)\n\
    exec mongod --config /etc/mongod.conf --replSet rs0\n\
    ' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 27017

# Sử dụng startup script
CMD ["/docker-entrypoint.sh"]