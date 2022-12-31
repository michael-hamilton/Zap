import React, {Component, createRef} from 'react';
import {transform} from '@babel/standalone';
import {CodeJar} from 'codejar';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark-dimmed.css';
import './zap.scss';


export default class Zap extends Component {
	constructor(props) {
		super(props);

		this.state = {
			code: '',
			transpiled: '',
			editorTab: 0,
			tab: 0,
			console: '',
			ifr: null,
		};

		this.iframe = createRef();
		this.editor = createRef();
	}

	componentDidMount() {
		hljs.configure({
			ignoreUnescapedHTML: true
		});
		hljs.registerLanguage('javascript', javascript);
		hljs.highlightAll();
		const jar = CodeJar(this.editor.current, hljs.highlightElement, { preserveIdent: false });
		jar.onUpdate(this.transpile.bind(this));

		window.addEventListener('message', (response) => {
			if (response.data && response.data.source === 'iframe') {
				this.setState({console: response.data.message});
			}
		});
		const iframe = this.iframe.current;
		const ifr = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
		this.setState({ifr})

		ifr.document.open();
		ifr.document.write(`
			<p id="a">hello</p>
			<script>
				const _log = console.log;
				console.log = (...rest) => {
					window.parent.postMessage(
						{
							source: 'iframe',
							message: JSON.stringify(rest),
						},
						'*'
					);
					_log.apply(console, arguments);
				};
			</script>
		`);
		ifr.document.close();
	}

	transpile(value) {
		const sourceCode = value;
		this.setState({sourceCode});
		const options = { presets: ['es2015-loose'] }
		const { code } = transform(sourceCode, options);
		this.setState({transpiled: code});
		const source = /* html */ `
      <html>
      <head>
      </head>
      <body>
        <script>
				const _log = console.log;
				console.log = (...rest) => {
					window.parent.postMessage(
						{
							source: 'iframe',
							message: JSON.stringify(rest),
						},
						'*'
					);
					_log.apply(console, arguments);
				};
			</script>
			<script>${code}</script>
      </body>
      </html>
    `
		this.iframe.current.srcdoc = source
	}

	render() {
		return (
			<div className='wrapper'>
				<div className='topWrapper'>
					<div className='editorWrapper'>
						<div className='tabWrapper'>
							<ul>
								<li className={this.state.editorTab === 0 ? 'active' : ''} onClick={() => this.setState({editorTab: 0})}>Project</li>
							</ul>
						</div>
						<div className='editor javascript' ref={this.editor} />
					</div>

					<div className='outputWrapper'>
						<iframe className='iframe' ref={this.iframe} />
					</div>
				</div>

				<div className='bottomWrapper'>
					<div className='tabWrapper'>
						<ul>
							<li className={this.state.tab === 0 ? 'active' : ''} onClick={() => this.setState({tab: 0})}>Console</li>
							<li className={this.state.tab === 1 ? 'active' : ''} onClick={() => this.setState({tab: 1})}>Transpiled</li>
						</ul>
					</div>

					<div className='tabContentWrapper'>
						{
							this.state.tab === 0 ?
								<div className='tabContent'>
									<pre className='consoleOutputWrapper'>
										<code className='language-javascript'>
											{this.state.console}
										</code>
									</pre>
								</div>
								:
								<div className='tabContent'>
									<pre className='transpiledCodeWrapper'>
										<code className='language-javascript'>
											{this.state.transpiled}
										</code>
									</pre>
								</div>
						}
					</div>
				</div>
			</div>
		)
	}
}