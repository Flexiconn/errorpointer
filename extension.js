const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


let enabled = false;

let errorpointerDecorationTypeError = vscode.window.createTextEditorDecorationType({
	isWholeLine: true,
	backgroundColor: "rgba(255, 18, 53,0.5)",
});

let errorpointerDecorationTypeWarning = vscode.window.createTextEditorDecorationType({
	isWholeLine: true,
	backgroundColor: "rgba(200,100,0,0.5)",
});

let errorpointerDecorationTypeHint = vscode.window.createTextEditorDecorationType({
	isWholeLine: true,
	backgroundColor: "rgba(20,120,40,0.5)",
});

let errorpointerDecorationTypeInfo = vscode.window.createTextEditorDecorationType({
	isWholeLine: true,
	backgroundColor: "rgba(40,20,120,0.5)",
});

function activate(context) {
	function ShowErrors(uri){
		//check if extension is enabled
		if(enabled == false){
			return;
		}

		//clear the errors to prevent duplication
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeError, []);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeHint, []);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeInfo, []);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeWarning, []);

		//retrieve errors
		let diagnostics = vscode.languages.getDiagnostics(uri);
		
		//array of errors to loop through
		var errors = []
		//array of infos to loop through
		var infos = []
		//array of hints to loop through
		var hints = []
		//array of warnings to loop through
		var warnings = []


		//go through all diagnostics
		diagnostics.forEach(x => {
			//variable to add prefix to a prefix to the error message
			var prefix
			switch (x.severity) {
				case 0:
					prefix = "Error: ";
					break;

				case 1:
					prefix = "Warning: ";
					break;

				case 2:
					prefix = "Info: ";
					break;

				case 3:
				default:
					prefix = "Hint: ";
					break;
			}

			//set rendering options
			const InstanceRenderOptions = {
				after: {
					contentText: prefix + x.message,
					fontStyle: "italic",
					fontWeight: "normal",
					margin: "40px",
					color: "rgba(255, 255, 255,1)"
				}
			};
	
			//set decoration options
			const DecorationOptions = {
				range: x.range,
				renderOptions: InstanceRenderOptions
			};

			//add diagnostic to array
			switch (x.severity) {
				case 0:
					errors.push(DecorationOptions);
					break;

				case 1:
					warnings.push(DecorationOptions);
					break;

				case 2:
					infos.push(DecorationOptions);
					break;

				case 3:
				default:
					hints.push(DecorationOptions);
					break;
			}
			
		});
		
		//apply the decorations
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeError, errors);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeHint, hints);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeInfo, infos);
		vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeWarning, warnings);
	}


	//register command to start the extension
	let disposable = vscode.commands.registerCommand(
		"errorpointer.start", function(){
			vscode.window.showInformationMessage("Started error pointer");
			ShowErrors(vscode.window.activeTextEditor.document.uri)
			enabled = true;
		}
	);

	let disposable2 = vscode.commands.registerCommand(
		"errorpointer.stop", function(){
			vscode.window.showInformationMessage("Turned off error pointer");
			enabled = false;
			//clear
			vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeError, []);
			vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeHint, []);
			vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeInfo, []);
			vscode.window.activeTextEditor.setDecorations(errorpointerDecorationTypeWarning, []);
		}
	);
	
  	context.subscriptions.push(disposable);

	//detect if open text editor changed
	vscode.window.onDidChangeActiveTextEditor(textEditor => {
        if (textEditor === undefined) {
            return;
        }
        ShowErrors(textEditor.document.uri );
    }, null, context.subscriptions);


	//test if the diagnostics changed
	vscode.languages.onDidChangeDiagnostics(diagnosticChangeEvent => { onChangedDiagnostics(diagnosticChangeEvent); }, null, context.subscriptions );

	//on open text editor
	vscode.workspace.onDidOpenTextDocument(textDocument => { ShowErrors( textDocument.uri ); }, null, context.subscriptions );



    function onChangedDiagnostics(diagnosticChangeEvent)
    {
		//check if window exists
        if( !vscode.window )
        {
            return;
        }

		//check if window is open
        const activeTextEditor = vscode.window.activeTextEditor;
        if( !activeTextEditor )
        {
            return;
        }
        
        // Many URIs can change - we only need to decorate the active text editor
        for (const uri of diagnosticChangeEvent.uris)
        {
            // Only update decorations for the active text editor.
            if ( uri.fsPath === activeTextEditor.document.uri.fsPath )
            {
                ShowErrors( uri );
                break;
            }
        }
    }

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
