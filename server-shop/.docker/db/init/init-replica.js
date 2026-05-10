// init-replica.js
// File này được đặt trong .docker/db/init-replica.js

sleep(5000);
print('🚀 Bắt đầu khởi tạo MongoDB Replica Set với Authentication...');

// Function để kiểm tra kết nối với keyfile authentication
function checkConnection(host) {
    try {
        var conn = new Mongo(host);
        // Với keyfile authentication, cluster members có thể giao tiếp internal
        var result = conn.getDB("admin").runCommand({ping: 1});
        print('✅ Kết nối thành công đến:', host);
        return true;
    } catch (e) {
        print('❌ Không thể kết nối đến:', host, '- Error:', e.message);
        return false;
    }
}

// Kiểm tra kết nối đến tất cả nodes
print('📡 Kiểm tra kết nối đến các nodes...');
var nodes = [
    'mongo-primary:27017',
    'mongo-secondary1:27017', 
    'mongo-secondary2:27017',
    'mongo-arbiter:27017'
];

var allConnected = true;
for (var i = 0; i < nodes.length; i++) {
    if (!checkConnection(nodes[i])) {
        allConnected = false;
    }
}

if (!allConnected) {
    print('❌ Không thể kết nối đến tất cả nodes. Dừng quá trình khởi tạo.');
    quit(1);
}

print('✅ Tất cả nodes đã sẵn sàng!');

// Kiểm tra xem replica set đã được khởi tạo chưa
try {
    var status = rs.status();
    print('ℹ️ Replica set đã tồn tại:', status.set);
    print('📊 Trạng thái hiện tại:');
    
    status.members.forEach(function(member) {
        print('  - ' + member.name + ': ' + member.stateStr);
    });
    
    print('✅ Replica set đã được khởi tạo trước đó.');
    
    // Kiểm tra xem đã có admin user chưa
    try {
        db.getSiblingDB("admin").auth("root", "shop2025");
        print('✅ Admin user đã tồn tại và có thể authenticate.');
    } catch (e) {
        print('⚠️ Admin user có thể chưa được tạo hoặc mật khẩu không đúng.');
    }
    
} catch (e) {
    print('📝 Replica set chưa tồn tại, đang khởi tạo...');
    print('⏳ Đợi thêm 10 giây để đảm bảo tất cả nodes ổn định...');
    sleep(10000);
    
    // Cấu hình replica set
    var config = {
        _id: "rs0",
        members: [
            { 
                _id: 0, 
                host: "mongo-primary:27017", 
                priority: 2 
            },
            { 
                _id: 1, 
                host: "mongo-secondary1:27017", 
                priority: 1 
            },
            { 
                _id: 2, 
                host: "mongo-secondary2:27017", 
                priority: 1 
            },
            { 
                _id: 3, 
                host: "mongo-arbiter:27017", 
                arbiterOnly: true,
                priority: 0
            }
        ],
        settings: {
            electionTimeoutMillis: 2000,
            heartbeatIntervalMillis: 1000
        }
    };
    
    try {
        print('🔧 Đang khởi tạo replica set với cấu hình:');
        printjson(config);
        
        var result = rs.initiate(config);
        
        if (result.ok === 1) {
            print('✅ Replica set rs0 đã được khởi tạo thành công!');
            
            // Đợi quá trình election hoàn thành
            print('⏳ Đợi quá trình election hoàn thành...');
            var maxWaitTime = 90; // Tăng thời gian chờ
            var waitTime = 0;
            var isReady = false;
            
            while (waitTime < maxWaitTime && !isReady) {
                sleep(3000);
                waitTime += 3;
                
                try {
                    var status = rs.status();
                    var primaryCount = 0;
                    var secondaryCount = 0;
                    
                    status.members.forEach(function(member) {
                        if (member.stateStr === 'PRIMARY') primaryCount++;
                        if (member.stateStr === 'SECONDARY') secondaryCount++;
                    });
                    
                    if (primaryCount === 1 && secondaryCount >= 1) {
                        isReady = true;
                        print('✅ Replica set đã sẵn sàng! (Primary: ' + primaryCount + ', Secondary: ' + secondaryCount + ')');
                    } else {
                        print('⏳ Đang đợi election... (đã đợi ' + waitTime + 's)');
                    }
                } catch (e) {
                    print('⏳ Đang đợi replica set ổn định... (đã đợi ' + waitTime + 's)');
                }
            }
            
            if (isReady) {
                // Tạo admin user trên PRIMARY node
                print('👤 Tạo admin user...');
                try {
                    // Đảm bảo chúng ta đang kết nối đến PRIMARY
                    var adminDB = db.getSiblingDB("admin");
                    var userResult = adminDB.createUser({
                        user: "root",
                        pwd: "shop2025",
                        roles: [
                            { role: "userAdminAnyDatabase", db: "admin" },
                            { role: "readWriteAnyDatabase", db: "admin" },
                            { role: "dbAdminAnyDatabase", db: "admin" },
                            { role: "clusterAdmin", db: "admin" }
                        ]
                    });
                    
                    if (userResult.ok === 1) {
                        print('✅ Admin user đã được tạo thành công!');
                        
                        // Test authentication
                        var authResult = adminDB.auth("root", "shop2025");
                        if (authResult === 1) {
                            print('✅ Admin user authentication test thành công!');
                        } else {
                            print('⚠️ Admin user authentication test thất bại');
                        }
                    } else {
                        print('⚠️ Có thể admin user đã tồn tại:', userResult);
                    }
                } catch (e) {
                    print('⚠️ Lỗi khi tạo admin user:', e.message);
                }
            } else {
                print('⚠️ Replica set có thể chưa hoàn toàn sẵn sàng sau ' + maxWaitTime + ' giây');
            }
            
            // Hiển thị trạng thái cuối cùng
            try {
                print('📊 Trạng thái replica set cuối cùng:');
                var finalStatus = rs.status();
                finalStatus.members.forEach(function(member) {
                    print('  - ' + member.name + ': ' + member.stateStr + 
                          (member.health === 1 ? ' (healthy)' : ' (unhealthy)'));
                });
            } catch (e) {
                print('⚠️ Không thể lấy trạng thái cuối cùng:', e.message);
            }
            
        } else {
            print('❌ Lỗi khởi tạo replica set:');
            printjson(result);
            quit(1);
        }
    } catch (error) {
        print('❌ Exception khi khởi tạo replica set:', error.message);
        quit(1);
    }
}

print('✨ Hoàn thành quá trình khởi tạo replica set!');
print('🔗 Để kết nối đến replica set với authentication, sử dụng:');
print('   mongodb://mongo-primary:27017,mongo-secondary1:27017,mongo-secondary2:27017/shop?replicaSet=rs0');