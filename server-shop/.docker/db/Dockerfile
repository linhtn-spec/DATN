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
    # Đảm bảo thư mục log tồn tại và có quyền đúng\n\
    mkdir -p /var/log/mongodb\n\
    chown -R mongodb:mongodb /var/log/mongodb\n\
    chmod 755 /var/log/mongodb\n\
    \n\
    # Khởi động MongoDB với user mongodb\n\
    exec gosu mongodb mongod --config /etc/mongod.conf --replSet rs0\n\
    ' > /docker-entrypoint.sh && \
    chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 27017

# Sử dụng startup script
CMD ["/docker-entrypoint.sh"]