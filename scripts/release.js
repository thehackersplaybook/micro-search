#!/usr/bin/env node

/**
 * Production-grade release script for @microsearch/lightning
 * Handles version bumping, tagging, building, testing, and npm publishing
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables from .env.local and .env
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  skipTests: process.argv.includes('--skip-tests'),
  skipBuild: process.argv.includes('--skip-build'),
  force: process.argv.includes('--force'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
  help: process.argv.includes('--help') || process.argv.includes('-h')
};

class ReleaseManager {
  constructor() {
    this.packageJsonPath = path.join(projectRoot, 'package.json');
    this.versionFilePath = path.join(projectRoot, 'src', 'version.ts');
    this.originalPackageJson = null;
    this.releaseType = null;
    this.newVersion = null;
    this.gitHash = null;
    this.gitBranch = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = chalk.gray(`[${timestamp}]`);
    
    switch (type) {
      case 'success':
        console.log(`${prefix} ${chalk.green('✓')} ${message}`);
        break;
      case 'error':
        console.log(`${prefix} ${chalk.red('✗')} ${message}`);
        break;
      case 'warning':
        console.log(`${prefix} ${chalk.yellow('⚠')} ${message}`);
        break;
      case 'info':
        console.log(`${prefix} ${chalk.blue('ℹ')} ${message}`);
        break;
      default:
        console.log(`${prefix} ${message}`);
    }
  }

  async execCommand(command, options = {}) {
    if (config.verbose) {
      this.log(`Executing: ${command}`, 'info');
    }
    
    try {
      const env = { ...process.env };
      if (process.env.NPM_TOKEN) {
        env['npm_config_//registry.npmjs.org/:_authToken'] = process.env.NPM_TOKEN;
      }
      
      const result = execSync(command, {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: config.verbose ? 'inherit' : 'pipe',
        env,
        ...options
      });
      return result;
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }

  async validatePrerequisites() {
    this.log('Validating prerequisites...');

    // Check git status unless forced
    if (!config.force) {
      try {
        const status = await this.execCommand('git status --porcelain');
        if (status.trim()) {
          throw new Error('Working directory has uncommitted changes. Use --force to override.');
        }
      } catch (error) {
        throw new Error('Could not check git status. Use --force to override.');
      }
    }

    // Check NPM authentication
    try {
      if (process.env.NPM_TOKEN) {
        this.log('Using NPM_TOKEN for authentication', 'info');
        await this.execCommand('npm whoami');
      } else {
        await this.execCommand('npm whoami');
      }
    } catch (error) {
      if (process.env.NPM_TOKEN) {
        throw new Error('NPM_TOKEN is invalid or expired. Please update your token.');
      } else {
        throw new Error('Not logged into npm. Run "npm login" first or set NPM_TOKEN in .env.local');
      }
    }

    // Get git info
    try {
      this.gitHash = (await this.execCommand('git rev-parse HEAD')).trim();
      this.gitBranch = (await this.execCommand('git rev-parse --abbrev-ref HEAD')).trim();
    } catch (error) {
      this.log('Could not get git info', 'warning');
      this.gitHash = '';
      this.gitBranch = 'unknown';
    }

    this.log('Prerequisites validated', 'success');
  }

  async runTests() {
    if (config.skipTests) {
      this.log('Skipping tests (--skip-tests)', 'warning');
      return;
    }

    this.log('Running tests...');
    await this.execCommand('npm test');
    await this.execCommand('npm run lint');
    this.log('All tests passed', 'success');
  }

  async buildProject() {
    if (config.skipBuild) {
      this.log('Skipping build (--skip-build)', 'warning');
      return;
    }

    this.log('Building project...');
    await this.execCommand('npm run build');
    this.log('Build completed', 'success');
  }

  async bumpVersion(releaseType) {
    this.log(`Bumping version (${releaseType})...`);
    
    const result = await this.execCommand(`npm version ${releaseType} --no-git-tag-version`);
    this.newVersion = result.trim().replace('v', '');
    
    this.log(`Version bumped to ${this.newVersion}`, 'success');
    return this.newVersion;
  }

  async updateVersionFile(version, gitHash, gitBranch) {
    const getReleaseType = (version) => {
      if (version.includes('-alpha')) return 'alpha';
      if (version.includes('-beta')) return 'beta';
      if (version.includes('-rc')) return 'rc';
      return 'stable';
    };

    const versionContent = `// Auto-generated version info - DO NOT EDIT MANUALLY
// This file is updated by the release script

export const VERSION_INFO: {
  version: string;
  buildDate: string;
  gitHash: string;
  gitBranch: string;
  releaseType: 'alpha' | 'beta' | 'rc' | 'stable';
} = {
  version: '${version}',
  buildDate: '${new Date().toISOString()}',
  gitHash: '${gitHash}',
  gitBranch: '${gitBranch}',
  releaseType: '${getReleaseType(version)}'
};

export const getVersionInfo = () => VERSION_INFO;

export const getFullVersionString = () => {
  const { version, buildDate, gitHash } = VERSION_INFO;
  const shortHash = gitHash && gitHash.length > 7 ? gitHash.substring(0, 7) : gitHash || 'unknown';
  return \`v\${version} (\${shortHash}) - \${new Date(buildDate).toISOString().split('T')[0]}\`;
};

export const isPreRelease = () => {
  return VERSION_INFO.version.includes('-') || VERSION_INFO.releaseType === 'alpha' || VERSION_INFO.releaseType === 'beta' || VERSION_INFO.releaseType === 'rc';
};

// Re-export version for convenience
export const version = VERSION_INFO.version;
export default VERSION_INFO;`;

    try {
      await fs.writeFile(this.versionFilePath, versionContent);
      this.log(`Updated version file: ${version}`, 'success');
    } catch (error) {
      throw new Error(`Failed to update version file: ${error.message}`);
    }
  }

  async createGitTag() {
    this.log('Creating git tag...');
    
    const tagName = `v${this.newVersion}`;
    const tagMessage = `Release ${tagName}`;
    
    await this.execCommand(`git add .`);
    await this.execCommand(`git commit -m "chore: release ${tagName}"`);
    await this.execCommand(`git tag -a ${tagName} -m "${tagMessage}"`);
    
    this.log(`Git tag created: ${tagName}`, 'success');
    return tagName;
  }

  async publishToNpm() {
    this.log('Publishing to npm...');
    
    const isPreRelease = this.newVersion.includes('-');
    const tag = isPreRelease ? 'next' : 'latest';
    
    if (config.dryRun) {
      this.log(`Dry run: npm publish --tag ${tag} --access public`, 'info');
      if (process.env.NPM_TOKEN) {
        this.log('NPM_TOKEN is configured', 'info');
      }
    } else {
      await this.execCommand(`npm publish --tag ${tag} --access public`);
      this.log(`Published to npm with tag: ${tag}`, 'success');
    }
  }

  async pushToGit() {
    this.log('Pushing to git...');
    
    if (config.dryRun) {
      this.log('Dry run: git push origin --tags', 'info');
    } else {
      await this.execCommand('git push origin --follow-tags');
      this.log('Pushed to git', 'success');
    }
  }

  async release(releaseType) {
    try {
      this.releaseType = releaseType;
      
      if (config.dryRun) {
        this.log('DRY RUN MODE - No actual changes will be made', 'warning');
      }

      await this.validatePrerequisites();
      await this.runTests();
      
      const newVersion = await this.bumpVersion(releaseType);
      await this.updateVersionFile(newVersion, this.gitHash, this.gitBranch);
      await this.buildProject();
      
      if (!config.dryRun) {
        const tagName = await this.createGitTag();
        await this.publishToNpm();
        await this.pushToGit();
        
        this.log(`🎉 Release ${tagName} completed successfully!`, 'success');
        this.log(`📦 Package published: npm install @microsearch/lightning@${newVersion}`, 'info');
      } else {
        this.log('Dry run completed - no changes made', 'info');
      }
      
    } catch (error) {
      this.log(`Release failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  showHelp() {
    console.log(`
${chalk.bold('@microsearch/lightning Release Script')}

Usage: npm run release <type> [options]

Release Types:
  patch      Increment patch version (0.0.1 -> 0.0.2)
  minor      Increment minor version (0.1.0 -> 0.2.0)
  major      Increment major version (1.0.0 -> 2.0.0)
  prerelease Increment prerelease version (1.0.0-alpha.1 -> 1.0.0-alpha.2)

Options:
  --dry-run     Show what would be done without making changes
  --skip-tests  Skip running tests
  --skip-build  Skip building the project
  --force       Ignore git status and other safety checks
  --verbose, -v Show detailed output
  --help, -h    Show this help message

Environment Variables:
  NPM_TOKEN     Set in .env.local for automated npm publishing

Examples:
  npm run release:patch
  npm run release:dry-run
  npm run release:prod
`);
  }
}

// Main execution
async function main() {
  const releaseManager = new ReleaseManager();
  
  if (config.help) {
    releaseManager.showHelp();
    process.exit(0);
  }

  const releaseType = process.argv[2];
  const validTypes = ['patch', 'minor', 'major', 'prerelease', 'prepatch', 'preminor', 'premajor'];
  
  if (!releaseType || !validTypes.includes(releaseType)) {
    releaseManager.log('Invalid or missing release type', 'error');
    releaseManager.showHelp();
    process.exit(1);
  }

  await releaseManager.release(releaseType);
}

main().catch((error) => {
  console.error(chalk.red('Release script failed:'), error);
  process.exit(1);
});