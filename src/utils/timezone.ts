/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import moment from '@nextcloud/moment'
import timezoneDataProviderService from '../services/timezoneDataProviderService.js'
import type { Timezone } from '@nextcloud/timezones'

type DateInput = Date | string | number | null | undefined

type MomentInstance = ReturnType<typeof moment>

function normalizeTimestamp(date: DateInput): number | null {
        if (date === null || date === undefined) {
                return null
        }
        if (typeof date === 'number') {
                return Number.isFinite(date) ? date : null
        }
        if (date instanceof Date) {
                const time = date.getTime()
                return Number.isFinite(time) ? time : null
        }
        if (typeof date === 'string') {
                const parsed = Date.parse(date)
                return Number.isFinite(parsed) ? parsed : null
        }
        return null
}

function getTimezone(timezoneId?: string): Timezone | null {
        if (!timezoneId) {
                return null
        }
        const timezoneManager = timezoneDataProviderService()
        const timezone = timezoneManager.getTimezoneForId(timezoneId)
        return timezone ?? null
}

export function getMomentInTimezone(date: DateInput, timezoneId?: string): MomentInstance {
        const timestamp = normalizeTimestamp(date)
        if (timestamp === null) {
                return moment.invalid()
        }

        const timezone = getTimezone(timezoneId)
        if (!timezone) {
                return moment(timestamp)
        }

        const [year, month, day, hour, minute, second] = timezone.timestampToArray(timestamp)
        const offsetSeconds = timezone.offsetForArray(year, month, day, hour, minute, second)
        const offsetMinutes = offsetSeconds / 60

        return moment(timestamp).utcOffset(offsetMinutes)
}

export function getTimezoneOffsetMinutes(date: DateInput, timezoneId?: string): number | null {
        const timestamp = normalizeTimestamp(date)
        if (timestamp === null) {
                return null
        }

        const timezone = getTimezone(timezoneId)
        if (!timezone) {
                return null
        }

        const [year, month, day, hour, minute, second] = timezone.timestampToArray(timestamp)
        const offsetSeconds = timezone.offsetForArray(year, month, day, hour, minute, second)
        return offsetSeconds / 60
}

export function formatTimeRange(date: DateInput, durationMinutes: number, timezoneId?: string): string {
        const startMoment = getMomentInTimezone(date, timezoneId)
        if (!startMoment.isValid()) {
                return ''
        }

        const endMoment = getMomentInTimezone(startMoment.valueOf() + durationMinutes * 60 * 1000, timezoneId)

        const startTime = startMoment.format('LT')

        if (!endMoment.isValid()) {
                return startTime
        }

        const endTime = endMoment.format('LT')

        return `${startTime} - ${endTime}`
}
