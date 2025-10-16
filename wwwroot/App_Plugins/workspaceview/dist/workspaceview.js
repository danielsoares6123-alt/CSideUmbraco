class MyWorkspaceView extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
      <div style="padding:20px; border:1px solid #ccc; background-color: #fff;">
        <h2>Importação de dados</h2>
        <p>Submeta um ficheiro Excel para importar os dados.</p>

        <form id="importForm">
        <input type="hidden" id="antiForgeryToken" name="__RequestVerificationToken" value='@Antiforgery.GetAndStoreTokens(HttpContext).RequestToken' />
          <div id="dropArea" style="
              border: 2px dashed #999;
              border-radius: 5px;
              padding: 20px;
              text-align: center;
              cursor: pointer;
              margin-bottom: 10px;
              color: #666;
              transition: border-color 0.3s, color 0.3s;">
            Arraste ou clique para selecionar ficheiro
            <input type="file" id="excelFile" accept=".xlsx,.xls" style="display:none;" />
          </div>

          <!-- Preview do ficheiro -->
          <div id="filePreview" style="margin-bottom:10px; color:#333;"></div>

          <button id="importButton" type="submit">Importar dados</button>
        </form>

        <p id="importMessage" style="margin-top:10px; color:green;"></p>
      </div>
    `;

        // Estilo do botão
        const style = document.createElement("style");
        style.textContent = `
      #importButton {
        background-color: var(--uui-button-background-color, transparent);
        color: var(--uui-button-contrast, var(--color-standalone));
        border: 1px solid var(--uui-button-border-color, #c2c2c2);
        font-weight: 700;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
      }
      #importButton:hover {
        background-color: var(--uui-color-default-emphasis, #3544b1);
        color: var(--uui-color-default-contrast, #fff);
      }
    `;
        this.appendChild(style);

        const form = this.querySelector("#importForm");
        const fileInput = this.querySelector("#excelFile");
        const message = this.querySelector("#importMessage");
        const dropArea = this.querySelector("#dropArea");
        const filePreview = this.querySelector("#filePreview");

        // Preview do ficheiro
        const showFilePreview = () => {
            if (fileInput.files.length) {
                const file = fileInput.files[0];
                filePreview.textContent = `Ficheiro selecionado: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
            } else {
                filePreview.textContent = "";
            }
        };

        // Drag & drop e clique
        dropArea.addEventListener("click", () => fileInput.click());
        dropArea.addEventListener("dragover", e => { e.preventDefault(); dropArea.style.borderColor = "#007ACC"; dropArea.style.color = "#007ACC"; });
        dropArea.addEventListener("dragleave", e => { e.preventDefault(); dropArea.style.borderColor = "#999"; dropArea.style.color = "#666"; });
        dropArea.addEventListener("drop", e => {
            e.preventDefault();
            dropArea.style.borderColor = "#999"; dropArea.style.color = "#666";
            if (e.dataTransfer.files.length) {
                fileInput.files = e.dataTransfer.files;
                showFilePreview();
            }
        });

        fileInput.addEventListener("change", showFilePreview);

        // Submit com token anti-forgery
        form.addEventListener("submit", async e => {
            e.preventDefault();

            if (!fileInput.files.length) {
                message.style.color = "red";
                message.textContent = "Por favor, selecione um ficheiro Excel.";
                return;
            }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("excelFile", file);

            message.style.color = "black";
            message.textContent = "A importar dados...";

            try {
                const response = await fetch("/umbraco/surface/Locator/ImportLaundries", {
                    method: "POST",
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    message.style.color = "green";
                    message.textContent = result.message || "Ficheiro importado com sucesso!";
                } else {
                    const errorText = await response.text();
                    message.style.color = "red";
                    message.textContent = "Erro ao importar: " + errorText;
                }
            } catch (err) {
                message.style.color = "red";
                message.textContent = "Erro ao importar: " + err.message;
            }
        });
    }
}

customElements.define("my-workspaceview", MyWorkspaceView);
