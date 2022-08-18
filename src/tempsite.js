var app = angular.module('app', []);
app.directive('convertToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val) {
                return val != null ? parseInt(val, 10) : null;
            });
            ngModel.$formatters.push(function(val) {
                return val != null ? '' + val : null;
            });
        }
    };
});
app.controller('ctrl', ['$scope', '$http', function($scope, $http) {
    $scope.auth = "";
    $scope.channelName = "";
    $scope.albuns = [];
    $scope.figurinhas = [];
    $scope.editAlbum = false;
    $scope.hasImageChanged = false;
    $scope.rewards = [];

    getMessages = (obj) => {
        var result = [];

        do {
            if (obj && obj.message) {
                result.push(obj.message)
            };

            obj = obj.innerError;
        } while (obj);

        return result.join('\r\n');
    };
    
    feedback = (message) => {
        var text;

        if (typeof message === 'string' || message instanceof String) {
            text = message;
        } else {
            text = getMessages(message);
        };

        Toastify({
            text: text,
            duration: 5000
        }).showToast();
    };
    
    $scope.emptyAlbum = {
        key: '',
        name: '',
        reward_id: '',
        image: {
            base64: '',
            display_url: ''
        }
    };
    $scope.album = { ...$scope.emptyAlbum };
    $scope.selectedAlbum = { ...$scope.emptyAlbum };
    
    $scope.emptyFigurinha = {
        key: '',
        album_key: '',
        name: '',
        rarity: 0,
        image: {
            base64: '',
            display_url: ''
        }
    };
    $scope.figurinha = { ...$scope.emptyFigurinha };

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
        $scope.hasImageChanged = true;
    };

    var loadFileBase64 = function (file) {
        var reader = new FileReader();
        reader.onerror = function () {
            feedback("Error loading file");
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
                    feedback("Nenhum album encontrado");
                };
            }).catch(function (e) {
                feedback(e.data);
            });
        } else {
            feedback("Preencha o auth do seu canal");
        };
    };

    $scope.deleteAlbum = (id) => {
        $http.delete('/album/' + id, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            feedback(result.status == 200 ? "Album excluido" : "Erro ao excluir album");
            $scope.listarAlbuns();
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    $scope.deleteFigurinha = (id) => {
        $http.delete('/figurinha/' + id, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            feedback(result.status == 200 ? "Figurinha excluida" : "Erro ao excluir figurinha");
            $scope.exibirFigurinhas($scope.selectedAlbum);
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    $scope.adicionarAlbum = () => {
        clear();
        $scope.editAlbum = true;
    };

    $scope.adicionarFigurinha = (album) => {
        clear();
        $scope.selectedAlbum = { ...album };
        $scope.figurinha.album_key = $scope.selectedAlbum.key;
        $scope.figurinha.rarity = 1;
        $scope.editFigurinha = true;
    };

    $scope.rarityDesc = (rarity) => {
        switch (rarity) {
            case 1:
                return "1 - Comum";
            case 2:
                return "2 - Incomum";
            case 3:
                return "3 - Rara";
            case 4:
                return "4 - Épica";
            default:
                return "";
        };
    };

    $scope.editarAlbum = (album) => {
        clear();
        $scope.editAlbum = true;
        $scope.album = album;
        loadUrlIntoCanvas(album.image.display_url);
    };

    $scope.editarFigurinha = (figurinha, selectedAlbum) => {
        clear();
        $scope.selectedAlbum = { ...selectedAlbum };
        $scope.editFigurinha = true;
        $scope.figurinha = figurinha;
        loadUrlIntoCanvas(figurinha.image.display_url);
    };

    $scope.showFileDialog = () => {
        var img = document.getElementById('imageDialog');
        img.value = "";
        img.click();
    };

    $scope.salvarFigurinha = () => {
        if (!$scope.figurinha.key) {
            feedback("Informe a chave da figurinha");
            return;
        };

        if (!$scope.figurinha.name) {
            feedback("Informe o nome da figurinha");
            return;
        };

        if (!$scope.figurinha.album_key) {
            feedback("Informe o album da figurinha");
            return;
        };

        $scope.figurinha.rarity = Number($scope.figurinha.rarity);

        if ($scope.figurinha.rarity < 1 || $scope.figurinha.rarity > 4) {
            feedback("Informe a raridade de 1 a 4 da figurinha");
            return;
        };

        if (!$scope.hasImageChanged) {
            feedback("Selecione uma imagem para a figurinha");
            return;
        };

        $scope.actualImageSrc = getBase64Image();

        if (!$scope.actualImageSrc || $scope.actualImageSrc.split(',').length !== 2) {
            feedback("Selecione a imagem da figurinha");
            return;
        };

        $scope.figurinha.image.base64 = $scope.actualImageSrc.split(',')[1];

        $http.post('/figurinha', $scope.figurinha, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            if (result.status == 200) {
                feedback("Figurinha salva com sucesso");
                $scope.exibirFigurinhas($scope.selectedAlbum);
            } else {
                feedback("Erro ao salvar figurinha");
            };
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    $scope.salvarAlbum = () => {
        if (!$scope.album.key) {
            feedback("Informe a chave do album");
            return;
        };

        if (!$scope.album.name) {
            feedback("Informe o nome do album");
            return;
        };

        if (!$scope.hasImageChanged) {
            feedback("Selecione uma imagem para o album");
            return;
        };
        
        $scope.actualImageSrc = getBase64Image();

        if (!$scope.actualImageSrc || $scope.actualImageSrc.split(',').length !== 2) {
            feedback("Selecione a imagem do album");
            return;
        };

        $scope.album.image.base64 = $scope.actualImageSrc.split(',')[1];

        $http.post('/album', $scope.album, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            if (result.status == 200) {
                feedback("Album salvo com sucesso");
                $scope.listarAlbuns();
            } else {
                feedback("Erro ao salvar album");
            };
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    $scope.exibirFigurinhas = (album) => {
        clear();
        $http.get('/figurinha?album_key=' + album.key, {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            if (result.status == 200) {
                $scope.figurinhas = result.data;
                $scope.selectedAlbum = { ...album };
            } else {
                feedback(result.data);
            };
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    var loadRewards = () => {
        $http.get('/rewards', {
            headers: {'Authorization': $scope.auth}
        }).then(function(result) {
            if (result.status == 200) {
                $scope.rewards = result.data;
            } else {
                feedback(result.data);
            };
        }).catch(function (e) {
            feedback(e.data);
        });
    };

    var clear = () => {
        $scope.albuns = [];
        loadUrlIntoCanvas("/album/image/default");
        $scope.hasImageChanged = false;
        $scope.editAlbum = false;
        $scope.editFigurinha = false;
        $scope.album = { ...$scope.emptyAlbum };
        $scope.selectedAlbum = { ...$scope.emptyAlbum };
        $scope.figurinha = { ...$scope.emptyFigurinha };
        $scope.figurinhas = [];
        loadRewards();
    };

    $scope.init = function() {
        canvas = document.getElementById('canvas');
        loadUrlIntoCanvas("/album/image/default");
        $scope.hasImageChanged = false;
        var dialog = document.getElementById('imageDialog');
        dialog.onchange = function (e) {
            e.preventDefault();
            var target = e.target;
            var files = target.files;

            if (files && files[0]) {
                loadFileBase64(files[0]);
                $scope.hasImageChanged = true;
            };
        };
    };
    $scope.init();
}]);
