#!/usr/bin/env node
/**
 * Simple complexity reporter for ESLint output
 * Runs locally without any external services
 */

let input = '';

process.stdin.on('data', (chunk) => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const results = JSON.parse(input);

    console.log('\n📊 Code Complexity Report\n');
    console.log('='.repeat(50));

    let totalWarnings = 0;
    let totalErrors = 0;
    let complexFiles = [];

    results.forEach((file) => {
      if (file.messages.length > 0) {
        totalWarnings += file.warningCount;
        totalErrors += file.errorCount;

        const complexity = file.messages.filter(
          (m) => m.ruleId && m.ruleId.includes('complexity'),
        );

        if (complexity.length > 0) {
          complexFiles.push({
            file: file.filePath.replace(process.cwd(), ''),
            issues: complexity.length,
          });
        }
      }
    });

    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log(`Files Analyzed: ${results.length}`);

    if (complexFiles.length > 0) {
      console.log('\n⚠️  Complex Files:');
      complexFiles.forEach((f) => {
        console.log(`  ${f.file} (${f.issues} complexity issues)`);
      });
    } else {
      console.log('\n✅ No complexity issues found!');
    }

    console.log('\n' + '='.repeat(50) + '\n');
  } catch (error) {
    console.error('Could not parse ESLint output');
    process.exit(0);
  }
});
