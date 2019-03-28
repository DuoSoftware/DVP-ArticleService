module.exports = {


    "Redis":
        {
            "mode": "sentinel",//instance, cluster, sentinel
            "ip": "45.55.142.207",
            "port": 6389,
            "user": "duo",
            "password": "DuoS123",
            "redisDB": 8,
            "sentinels": {
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port": 16389,
                "name": "redis-cluster"
            }

        },


    "Security":
        {

            "ip": "45.55.142.207",
            "port": 6389,
            "user": "duo",
            "password": "DuoS123",
            "mode": "sentinel",//instance, cluster, sentinel
            "sentinels": {
                "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
                "port": 16389,
                "name": "redis-cluster"
            }
        },


    "Host":
        {
            "resource": "cluster",
            "vdomain": "127.0.0.1",
            "domain": "127.0.0.1",
            "port": "3637",
            "version": "1.0.0.0"
        },

    "LBServer": {

        "ip": "192.168.0.101",
        "port": "3636"

    },

    "Mongo":
        {
            "ip": "104.236.231.11",
            "port": "27017",
            "dbname": "dvpdb",
            "password": "DuoS123",
            "user": "duo"
        },

    "Services": {
        "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",
        "resourceServiceHost": "resourceservice.app.veery.cloud",
        "resourceServicePort": "8831",
        "resourceServiceVersion": "1.0.0.0",

    }

};