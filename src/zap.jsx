import React, {Component, createRef} from 'react';
import { FaPlay } from 'react-icons/fa';
import {transform} from '@babel/standalone';
import {CodeJar} from 'codejar';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/github-dark-dimmed.css';
import {canvasEditorOutput} from './output';
import './zap.scss';


export default class Zap extends Component {
	constructor(props) {
		super(props);

		this.state = {
			code: '',
			transpiled: '',
			editorTab: 0,
			tab: 0,
			console: [],
			ifr: null,
		};

		this.iframe = createRef();
		this.editor = createRef();
		this.jar;
	}

	componentDidMount() {
		hljs.configure({
			ignoreUnescapedHTML: true
		});
		hljs.registerLanguage('javascript', javascript);
		hljs.highlightAll();

		this.jar = CodeJar(this.editor.current, hljs.highlightElement, { preserveIdent: false });

		window.addEventListener('message', (response) => {
			if (response.data && response.data.source === 'iframe') {
				let msg = response.data.message[0];
				if(typeof(msg) === 'object') {
					msg = JSON.stringify(msg);
				}
				this.setState({console: [...this.state.console, msg]});
			}
		});

		window.addEventListener('keydown', (e) => {
			if(e.key === 'r' || e.key === 'R' && e.ctrlKey === true) {
				this.transpile();
			}
		});

		const iframe = this.iframe.current;
		const ifr = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
		this.setState({ifr})
	}

	transpile() {
		const value = this.jar.toString()
		this.setState({console: []}, () => {
			try {
				const sourceCode = value;
				this.setState({sourceCode});
				const options = {presets: ['es2015-loose'], plugins: []}
				const {code} = transform(sourceCode, options);
				this.setState({transpiled: code});
				this.iframe.current.srcdoc = canvasEditorOutput(code);
			} catch (err) {
				this.setState({console: [...this.state.console, err]})
				this.iframe.current.srcdoc = canvasEditorOutput(err);
			}
		});
	}

	render() {
		return (
			<div className='wrapper'>
				<div className='topWrapper'>
					<div className='editorWrapper'>
						<div className='tabWrapper'>
							<ul className='documentList'>
								<li className={this.state.editorTab === 0 ? 'active' : ''} onClick={() => this.setState({editorTab: 0})}>Project</li>
							</ul>
							<ul className='controlsList'>
								<button onClick={this.transpile.bind(this)}>
									<FaPlay />
								</button>
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

					<div className='bottomContentWrapper'>
						{
							this.state.tab === 0 ?
								<div className='tabContentWrapper'>
									<div className='tabContent'>
										<pre className='consoleOutputWrapper'>
											<code className='language-javascript'>
												{this.state.console.map(msg => `${msg}\n`)}
											</code>
										</pre>
									</div>
								</div>
								:
								<div className='tabContentWrapper'>
									<div className='tabContent'>
										<pre className='transpiledCodeWrapper'>
											<code className='language-javascript'>
												{this.state.transpiled}
											</code>
										</pre>
									</div>
								</div>
						}
					</div>
				</div>
			</div>
		)
	}
}