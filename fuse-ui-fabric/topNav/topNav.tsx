import { lazy } from '@fuselab/ui-shared/lib';
import { IBaseProps, KeyCodes } from '@uifabric/utilities';
import { DefaultButton } from 'office-ui-fabric-react/lib-commonjs/Button';
import { IPanelProps, Panel, PanelType } from 'office-ui-fabric-react/lib-commonjs/Panel';
import { BaseComponent } from 'office-ui-fabric-react/lib-commonjs/Utilities';
import * as React from 'react';
import { LogoHeader } from '../logoHeader';
import { User } from '../userProfile';
import classNames from './topNav.classNames';

export enum TopNavPanels {
  none = 'none',
  apps = 'apps',
  notification = 'notification',
  settings = 'settings',
  feedback = 'feedback',
  help = 'help'
}

export interface TopNavProps extends IBaseProps {
  panels: TopNavPanels[];
  getPanelCount(panel: TopNavPanels): number;
  renderNavPanel(panel: TopNavPanels): JSX.Element;
  renderNavPanelFooter(panel: TopNavPanels): JSX.Element;
}

export interface TopNavState {
  openPanel: TopNavPanels;
}

const panelIcons = {
  [TopNavPanels.apps]: 'ms-Icon--Waffle',
  [TopNavPanels.notification]: 'ms-Icon--Ringer',
  [TopNavPanels.settings]: 'ms-Icon--Settings',
  [TopNavPanels.feedback]: 'ms-Icon--Emoji2',
  [TopNavPanels.help]: 'ms-Icon--Help'
};

/**
 * common top navigation widget with logo and waffle on the left,
 * settings, feedback, help, and user login/logout widget out the right.
 */
export class TopNav extends BaseComponent<TopNavProps, TopNavState> {
  constructor(props: TopNavProps) {
    super(props);
    this.state = { openPanel: TopNavPanels.none };
  }

  public render(): JSX.Element {
    const panel = this.state.openPanel;
    const panelContent = panel !== TopNavPanels.none ? this.props.renderNavPanel(panel) : null;
    const panelProps = {
      type: PanelType.smallFixedFar,
      layerProps: { styles: { root: { top: 40, height: 'calc(100vh - 40px)' } } },
      ...(this.panelProps[panel] || {})
    };

    const renderNavButton = this.renderNavButton.bind(this, this.props.getPanelCount);

    return (
      <header className={classNames().root} >
        <div className={classNames().inner}>
          {renderNavButton(TopNavPanels.apps, this.navClickApps)}
          <LogoHeader />
          {renderNavButton(TopNavPanels.notification, this.navClickNotificaiton)}
          {renderNavButton(TopNavPanels.settings, this.navClickSettings)}
          {renderNavButton(TopNavPanels.feedback, this.navClickFeedback)}
          {renderNavButton(TopNavPanels.help, this.navClickHelp)}
          <User darkTopNav={true} />
        </div>
        {this.renderPanel(panel, panelProps, panelContent)}
      </header>);
  }

  private renderPanel(panel: TopNavPanels, panelProps: IPanelProps, panelContent: JSX.Element): JSX.Element {
    if (this.state.openPanel === TopNavPanels.none) {
      return null;
    }

    return (
      <Panel
        key={`panel_${panel}`}
        {...panelProps}
        isOpen={true}
        onDismiss={this.onPanelDismiss}
      >
        {panelContent}
      </Panel>);
  }

  private renderNavButton(getCount: (p: TopNavPanels) => number, panel: TopNavPanels, handler: React.MouseEventHandler<HTMLElement>): JSX.Element {
    const count = getCount(panel);

    if (this.props.panels.indexOf(panel) < 0) {
      return null;
    }

    return (
      <i
        role='button'
        tabIndex={0}
        className={this.getIconClassNames(panel)}
        aria-hidden={true}
        title={panel}
        onClick={handler}
        onKeyUp={this.keyActivate}
      >
        {(count > 0) ? <div className={classNames().counter}>{count}</div> : null}
      </i>
    );
  }

  private get keyActivate(): React.KeyboardEventHandler<HTMLElement> {
    return x => {
      const keyCode = x.which;
      if (keyCode === KeyCodes.space || keyCode === KeyCodes.enter) {
        x.currentTarget.click();
        x.preventDefault();
        x.stopPropagation();
      }
    };
  }

  private getIconClassNames(panel: TopNavPanels): string {
    return `${classNames().icon} ${panelIcons[panel]} ${this.state.openPanel === panel ? classNames().activeIcon : ''}`;
  }

  @lazy()
  private get navClickApps(): React.MouseEventHandler<HTMLElement> {
    return this.iconClicked.bind(this, TopNavPanels.apps);
  }

  @lazy()
  private get navClickNotificaiton(): React.MouseEventHandler<HTMLElement> {
    return this.iconClicked.bind(this, TopNavPanels.notification);
  }

  @lazy()
  private get navClickSettings(): React.MouseEventHandler<HTMLElement> {
    return this.iconClicked.bind(this, TopNavPanels.settings);
  }

  @lazy()
  private get navClickFeedback(): React.MouseEventHandler<HTMLElement> {
    return this.iconClicked.bind(this, TopNavPanels.feedback);
  }

  @lazy()
  private get navClickHelp(): React.MouseEventHandler<HTMLElement> {
    return this.iconClicked.bind(this, TopNavPanels.help);
  }

  @lazy()
  private get panelProps(): { [key: string]: IPanelProps } {
    return {
      [TopNavPanels.apps]: {
        type: PanelType.smallFixedNear,
        onRenderNavigation: this.renderWaffleHeader,
        layerProps: {
          styles: {
            root: { top: 0, height: '100vh' },
            content: { selectors: { '.ms-Panel-content': { paddingLeft: 20, paddingRight: 20 } } }
          }
        }
      },
      [TopNavPanels.feedback]: {
        headerText: 'Send us feedback',
        isFooterAtBottom: true,
        onRenderFooterContent: this.props.renderNavPanelFooter.bind(this.props, TopNavPanels.feedback)
      },
      [TopNavPanels.notification]: {
        headerText: 'Notifications'
      }
    };
  }

  @lazy()
  private get renderWaffleHeader(): (props: IPanelProps, defaultRender?: (props?: IPanelProps) => JSX.Element | null) => JSX.Element {
    return (props, render) => (
      <div>
        <DefaultButton onClick={this.onPanelDismiss} className={classNames().wafflePanelHeader}><i className='ms-Icon ms-Icon--Waffle' /></DefaultButton>
      </div>
    );
  }

  @lazy()
  private get onPanelDismiss(): () => void {
    return () => {
      this.setState({ openPanel: TopNavPanels.none });
    };
  }

  private iconClicked(openPanel: TopNavPanels, e: React.MouseEvent<HTMLElement>) {
    if (this.state.openPanel === openPanel) {
      this.setState({ openPanel: TopNavPanels.none });
    } else {
      this.setState({ openPanel });
    }
  }
}
