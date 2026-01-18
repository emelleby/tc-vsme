import type { Meta, StoryObj } from '@storybook/react-vite'
import { LanguageSwitcher, type Language } from './LanguageSwitcher'

const meta = {
  component: LanguageSwitcher,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'ghost'],
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
  },
} satisfies Meta<typeof LanguageSwitcher>

export default meta
type Story = StoryObj<typeof meta>

const languages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
]

export const Default: Story = {
  args: {
    languages,
    value: 'en',
    variant: 'outline',
    align: 'end',
    onChange: (code) => console.log('Selected language:', code),
  },
}

export const Ghost: Story = {
  args: {
    languages,
    value: 'en',
    variant: 'ghost',
    align: 'end',
    onChange: (code) => console.log('Selected language:', code),
  },
}

export const AlignStart: Story = {
  args: {
    languages,
    value: 'de',
    variant: 'outline',
    align: 'start',
    onChange: (code) => console.log('Selected language:', code),
  },
}

export const AlignCenter: Story = {
  args: {
    languages,
    value: 'fr',
    variant: 'outline',
    align: 'center',
    onChange: (code) => console.log('Selected language:', code),
  },
}

export const WithCustomClass: Story = {
  args: {
    languages,
    value: 'es',
    variant: 'outline',
    align: 'end',
    className: 'w-full',
    onChange: (code) => console.log('Selected language:', code),
  },
}

export const TwoLanguages: Story = {
  args: {
    languages: [
      { code: 'en', label: 'English' },
      { code: 'de', label: 'Deutsch' },
    ],
    value: 'en',
    variant: 'outline',
    align: 'end',
    onChange: (code) => console.log('Selected language:', code),
  },
}

