// Run by macOS JavaScript for Automation, using Foundation only.
// No Apple events, network requests or access to another app's documents.
ObjC.import('Foundation');

function run() {
  const environment = $.NSProcessInfo.processInfo.environment;
  const env = key => ObjC.unwrap(environment.objectForKey(key)) || '';
  const manager = $.NSFileManager.defaultManager;
  let binary = env('ANYCAP_MCP_BIN');
  if (!binary) {
    for (const app of ['/Applications/Anycap.app', env('HOME') + '/Applications/Anycap.app']) {
      const candidate = app + '/Contents/MacOS/anycap-mcp';
      if (manager.isExecutableFileAtPath(candidate)) { binary = candidate; break; }
    }
  }
  if (!binary) throw new Error('Install Anycap on your Mac first.');

  const text = env('POPCLIP_TEXT').trim();
  const urls = env('POPCLIP_URLS').trim().split(/\s+/).filter(Boolean);
  let args;
  if (/^https?:\/\/\S+$/i.test(text)) args = { url: text };
  else if (urls.length) {
    args = { url: urls[0] };
    if (text) args.text = text;
  } else if (text) args = { text };
  else throw new Error('Select some text or a link first.');

  const task = $.NSTask.alloc.init;
  task.executableURL = $.NSURL.fileURLWithPath(binary);
  const input = $.NSPipe.pipe;
  const output = $.NSPipe.pipe;
  task.standardInput = input;
  task.standardOutput = output;
  const error = Ref();
  if (!task.launchAndReturnError(error)) throw new Error('Could not start Anycap.');
  const requests = [
    { jsonrpc: '2.0', id: 1, method: 'initialize', params: {} },
    { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'save', arguments: args } }
  ].map(value => JSON.stringify(value)).join('\n') + '\n';
  input.fileHandleForWriting.writeData($(requests).dataUsingEncoding($.NSUTF8StringEncoding));
  input.fileHandleForWriting.closeFile;
  const data = output.fileHandleForReading.readDataToEndOfFile;
  task.waitUntilExit;
  const response = ObjC.unwrap($.NSString.alloc.initWithDataEncoding(data, $.NSUTF8StringEncoding));
  for (const line of response.split('\n')) {
    let message;
    try { message = JSON.parse(line); } catch (_) { continue; }
    if (message.id !== 2) continue;
    if (message.error) throw new Error(message.error.message || 'Anycap could not save the selection.');
    const result = message.result;
    if (!result || result.isError) {
      throw new Error(result && result.content && result.content[0] ? result.content[0].text : 'Anycap could not save the selection.');
    }
    return result.content && result.content[0] ? result.content[0].text : 'Saved to Anycap.';
  }
  throw new Error('Anycap did not confirm the capture.');
}
