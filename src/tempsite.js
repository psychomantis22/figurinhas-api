var app = angular.module('app', []);
app.controller('ctrl', ['$scope', '$http', function($scope, $http) {
    $scope.feedback;
    $scope.auth = "pmantis;4xdvn66voubxaczhwao7avnwf14ruv";
    $scope.channelName;
    $scope.albuns = [];
    $scope.editAlbum = false;
    
    $scope.emptyAlbum = {
        key: '',
        name: '',
        image: {
            base64: '',
            display_url: ''
        }
    };
    $scope.album = $scope.emptyAlbum;

    var canvas;
    var imageObject = new Image();
    imageObject.crossOrigin = "anonymous";
    imageObject.onload = function (ev) {
        var ctx = canvas.getContext("2d");

        canvas.width = 240;
        canvas.height = 360;

        var maxWidth = canvas.width;
        var maxHeight = canvas.height;

        var newWidth = this.width;
        var newHeight = this.height;

        if (this.width > maxWidth || this.height > maxHeight) {
            var canvasRatio = maxWidth / maxHeight;
            var imageRatio = this.width / this.height;

            if (imageRatio > canvasRatio) {
                newWidth = maxWidth;
                newHeight = this.height * (maxWidth / this.width);
            } else {
                newWidth = this.width * (maxHeight / this.height);
                newHeight = maxHeight;
            };
        };

        ctx.drawImage(imageObject, 0, 0, newWidth, newHeight);
    };
    
    var getBase64Image = function () {
        return canvas.toDataURL("image/png");
    };

    var loadUrlIntoCanvas = function (url) {
        imageObject.src = url;
    };

    var loadFileBase64 = function (file) {
        var reader = new FileReader();
        reader.onerror = function () {
            $scope.feedback = "Error loading file";
        };
    
        reader.onload = function (ev) {
            imageObject.src = ev.target.result;
        };
    
        reader.readAsDataURL(file);
    };

    $scope.getAuth = () => {
        window.location.href = '/auth/token?channel=' + $scope.channelName
    };

    $scope.listarAlbuns = () => {
        clear();
        if ($scope.auth) {
            $http.get('/album', {
                headers: {'Authorization': $scope.auth}
            }).then(function (result) {
                $scope.albuns = result.data;

                if ($scope.albuns.length == 0) {
                    $scope.feedback = "Nenhum album encontrado";
                };
            }).catch(function (e) {
                $scope.feedback = e.data;
            });
        } else {
            $scope.feedback = "Preencha o auth do seu canal";
        };
    };

    $scope.deleteAlbum = (id) => {
        $http.delete('/album/' + id, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            $scope.feedback = result.status == 200 ? "Album excluido" : "Erro ao excluir album";
            $scope.listarAlbuns();
        }).catch(function (e) {
            $scope.feedback = e.data;
        });
    };

    $scope.adicionarAlbum = () => {
        clear();
        $scope.editAlbum = true;
    };

    $scope.editarAlbum = (album) => {
        clear();
        $scope.editAlbum = true;
        $scope.album = album;
        loadUrlIntoCanvas(album.image.display_url);
    };

    $scope.showFileDialog = () => {
        var img = document.getElementById('imageDialog');
        img.value = "";
        img.click();
    };

    $scope.salvarAlbum = () => {
        if (!$scope.album.key) {
            $scope.feedback = "Informe a chave do album";
            return;
        };

        if (!$scope.album.name) {
            $scope.feedback = "Informe o nome do album";
            return;
        };
        
        $scope.actualImageSrc = getBase64Image();

        if (!$scope.actualImageSrc || $scope.actualImageSrc.split(',').length !== 2) {
            $scope.feedback = "Selecione a imagem do album";
            return;
        };

        $scope.album.image.base64 = $scope.actualImageSrc.split(',')[1];

        $http.post('/album', $scope.album, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            if (result.status == 200) {
                $scope.feedback = "Album inserido com sucesso";
                $scope.listarAlbuns();
            } else {
                $scope.feedback = "Erro ao inserir album";
            };
        }).catch(function (e) {
            $scope.feedback = e.data;
        });
    };

    var clear = () => {
        $scope.albuns = [];
        loadUrlIntoCanvas("/album/image/default");
        $scope.editAlbum = false;
        $scope.album = $scope.emptyAlbum;
    };

    $scope.init = function() {
        canvas = document.getElementById('canvas');
        loadUrlIntoCanvas("/album/image/default");
        var dialog = document.getElementById('imageDialog');
        dialog.onchange = function (e) {
            e.preventDefault();
            var target = e.target;
            var files = target.files;

            if (files && files[0]) {
                loadFileBase64(files[0]);
            };
        };
    };
    $scope.init();
}]);
