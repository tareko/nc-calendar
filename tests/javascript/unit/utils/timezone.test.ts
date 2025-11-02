/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from '@nextcloud/moment'
import { describe, expect, it } from 'vitest'

import { formatTimeRange, getMomentInTimezone } from '../../../../src/utils/timezone'

describe('timezone utils', () => {
        const timezoneNewYork = 'America/New_York'
        const timezoneBerlin = 'Europe/Berlin'

        it('handles DST fall back transitions when computing offsets', () => {
                moment.locale('en')

                const beforeFallback = getMomentInTimezone('2024-11-03T05:30:00Z', timezoneNewYork)
                const afterFallback = getMomentInTimezone('2024-11-03T06:30:00Z', timezoneNewYork)

                expect(beforeFallback.isValid()).toBe(true)
                expect(afterFallback.isValid()).toBe(true)

                expect(beforeFallback.utcOffset()).toBe(-240)
                expect(afterFallback.utcOffset()).toBe(-300)

                expect(beforeFallback.format('YYYY-MM-DD HH:mm')).toBe('2024-11-03 01:30')
                expect(afterFallback.format('YYYY-MM-DD HH:mm')).toBe('2024-11-03 01:30')
        })

        it('handles DST spring forward transitions when computing offsets', () => {
                moment.locale('en')

                const beforeForward = getMomentInTimezone('2025-03-30T00:30:00Z', timezoneBerlin)
                const afterForward = getMomentInTimezone('2025-03-30T01:30:00Z', timezoneBerlin)

                expect(beforeForward.isValid()).toBe(true)
                expect(afterForward.isValid()).toBe(true)

                expect(beforeForward.utcOffset()).toBe(60)
                expect(afterForward.utcOffset()).toBe(120)

                expect(beforeForward.format('YYYY-MM-DD HH:mm')).toBe('2025-03-30 01:30')
                expect(afterForward.format('YYYY-MM-DD HH:mm')).toBe('2025-03-30 03:30')
        })

        it('formats time ranges across DST transitions', () => {
                moment.locale('en')

                const fallBackRange = formatTimeRange('2024-11-03T05:30:00Z', 60, timezoneNewYork)
                expect(fallBackRange).toBe('1:30 AM - 1:30 AM')

                const springForwardRange = formatTimeRange('2025-03-30T00:30:00Z', 60, timezoneBerlin)
                expect(springForwardRange).toBe('1:30 AM - 3:30 AM')
        })
})
